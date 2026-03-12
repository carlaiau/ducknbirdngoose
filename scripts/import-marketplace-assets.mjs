#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const DEFAULTS = {
  inputDir: path.join(repoRoot, 'marketplace-downloads'),
  outputDir: path.join(repoRoot, 'public', 'assets', 'models'),
  manifestPath: path.join(repoRoot, 'src', 'data', 'assetManifest.ts'),
  tempDir: path.join(repoRoot, '.tmp', 'marketplace-assets'),
  blenderScriptPath: path.join(__dirname, 'blender-convert-to-glb.py'),
}

const SUPPORTED_EXTENSIONS = ['.glb', '.gltf', '.fbx', '.obj']
const EXTENSION_PRIORITY = new Map(
  SUPPORTED_EXTENSIONS.map((extension, index) => [extension, index]),
)

const helpText = `Import downloaded marketplace assets into the runtime.

Usage:
  npm run assets:import
  npm run assets:import -- --only bird-marketplace,duck-marketplace
  npm run assets:import -- --input-dir /path/to/downloads --dry-run

Input layout:
  marketplace-downloads/
    bird-marketplace.zip
    duck-marketplace/
    goose-marketplace.glb

Accepted sources:
  - .zip archives containing .glb/.gltf/.fbx/.obj assets
  - extracted folders named after the manifest asset id
  - single .glb/.gltf/.fbx/.obj files named after the manifest asset id

Notes:
  - Sketchfab purchases/downloads must still be fetched manually.
  - .gltf files are converted to .glb with gltf-pipeline.
  - .fbx/.obj files are converted through Blender when the blender CLI is available.
  - Successful imports update src/data/assetManifest.ts automatically.
`

function parseArgs(argv) {
  const options = {
    inputDir: DEFAULTS.inputDir,
    outputDir: DEFAULTS.outputDir,
    manifestPath: DEFAULTS.manifestPath,
    tempDir: DEFAULTS.tempDir,
    keepTemp: false,
    dryRun: false,
    only: null,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    switch (arg) {
      case '--input-dir':
        options.inputDir = path.resolve(argv[index + 1])
        index += 1
        break
      case '--output-dir':
        options.outputDir = path.resolve(argv[index + 1])
        index += 1
        break
      case '--manifest':
        options.manifestPath = path.resolve(argv[index + 1])
        index += 1
        break
      case '--temp-dir':
        options.tempDir = path.resolve(argv[index + 1])
        index += 1
        break
      case '--only':
        options.only = argv[index + 1]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
        index += 1
        break
      case '--keep-temp':
        options.keepTemp = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
      case '-h':
        console.log(helpText)
        process.exit(0)
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return options
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.status !== 0) {
    const stderr = [result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n')
      .trim()
    throw new Error(stderr || `${command} exited with status ${result.status}`)
  }
}

function getNpxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx'
}

function getBlenderCommand() {
  const candidates = process.platform === 'win32'
    ? ['blender.exe', 'blender']
    : ['blender']

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8', stdio: 'pipe' })
    if (probe.status === 0) {
      return candidate
    }
  }

  return null
}

function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findFilesRecursive(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) {
        return findFilesRecursive(entryPath)
      }

      return [entryPath]
    }),
  )

  return files.flat()
}

async function pickBestSourceFile(rootPath) {
  const files = await findFilesRecursive(rootPath)
  const candidates = await Promise.all(
    files
      .filter((filePath) => SUPPORTED_EXTENSIONS.includes(path.extname(filePath).toLowerCase()))
      .map(async (filePath) => ({
        filePath,
        extension: path.extname(filePath).toLowerCase(),
        size: (await stat(filePath)).size,
      })),
  )

  if (candidates.length === 0) {
    throw new Error(`No supported source model found inside ${rootPath}`)
  }

  candidates.sort((left, right) => {
    const priorityDelta =
      (EXTENSION_PRIORITY.get(left.extension) ?? Number.MAX_SAFE_INTEGER)
      - (EXTENSION_PRIORITY.get(right.extension) ?? Number.MAX_SAFE_INTEGER)

    if (priorityDelta !== 0) {
      return priorityDelta
    }

    if (right.size !== left.size) {
      return right.size - left.size
    }

    return left.filePath.localeCompare(right.filePath)
  })

  return candidates[0].filePath
}

async function resolveAssetInput(inputDir, assetId) {
  const explicitTargets = [
    path.join(inputDir, `${assetId}.zip`),
    path.join(inputDir, assetId),
    ...SUPPORTED_EXTENSIONS.map((extension) => path.join(inputDir, `${assetId}${extension}`)),
  ]

  for (const targetPath of explicitTargets) {
    if (!existsSync(targetPath)) {
      continue
    }

    const details = await stat(targetPath)
    if (details.isDirectory()) {
      return { type: 'directory', path: targetPath }
    }

    if (path.extname(targetPath).toLowerCase() === '.zip') {
      return { type: 'zip', path: targetPath }
    }

    return { type: 'file', path: targetPath }
  }

  return null
}

async function extractArchive(archivePath, extractPath) {
  await rm(extractPath, { recursive: true, force: true })
  await mkdir(extractPath, { recursive: true })
  runCommand('unzip', ['-q', '-o', archivePath, '-d', extractPath])
}

async function convertToGlb({ assetId, sourcePath, destinationPath, blenderScriptPath }) {
  const extension = path.extname(sourcePath).toLowerCase()

  if (extension === '.glb') {
    await copyFile(sourcePath, destinationPath)
    return
  }

  if (extension === '.gltf') {
    runCommand(getNpxCommand(), ['gltf-pipeline', '-i', sourcePath, '-o', destinationPath, '--binary'])
    return
  }

  if (extension === '.fbx' || extension === '.obj') {
    const blenderCommand = getBlenderCommand()
    if (!blenderCommand) {
      throw new Error(
        `${assetId} needs Blender for ${extension} conversion. Install blender or provide a .glb/.gltf source instead.`,
      )
    }

    runCommand(blenderCommand, ['-b', '-P', blenderScriptPath, '--', sourcePath, destinationPath], {
      cwd: path.dirname(sourcePath),
    })
    return
  }

  throw new Error(`Unsupported conversion format: ${extension}`)
}

function updateManifestEntry(manifestSource, assetId, runtimePath) {
  const entryPattern = new RegExp(
    `(id: '${escapeRegExp(assetId)}',[\\s\\S]*?importedFileType: )'(?:glb|gltf|none)'([\\s\\S]*?runtimePath: )(null|'[^']*')`,
    'm',
  )

  if (!entryPattern.test(manifestSource)) {
    throw new Error(`Could not update manifest entry for ${assetId}`)
  }

  return manifestSource.replace(entryPattern, `$1'glb'$2'${runtimePath}'`)
}

function readAssetIds(manifestSource) {
  return Array.from(
    manifestSource.matchAll(/id: '([^']+)'/g),
    ([, assetId]) => assetId,
  )
}

async function importAsset({
  assetId,
  inputDir,
  outputDir,
  tempDir,
  dryRun,
  blenderScriptPath,
}) {
  const assetInput = await resolveAssetInput(inputDir, assetId)
  if (!assetInput) {
    return {
      assetId,
      status: 'skipped',
      message: `No source found in ${inputDir}`,
    }
  }

  let workingRootPath
  let sourcePath

  if (assetInput.type === 'zip') {
    workingRootPath = path.join(tempDir, assetId)
    if (dryRun) {
      sourcePath = assetInput.path
    } else {
      await extractArchive(assetInput.path, workingRootPath)
    }
  } else if (assetInput.type === 'directory') {
    workingRootPath = assetInput.path
  } else {
    sourcePath = assetInput.path
  }

  if (!sourcePath && workingRootPath) {
    sourcePath = await pickBestSourceFile(workingRootPath)
  }

  const destinationPath = path.join(outputDir, `${assetId}.glb`)
  const publicRoot = path.join(repoRoot, 'public')
  const runtimePath = path.relative(publicRoot, destinationPath)

  if (runtimePath.startsWith('..')) {
    throw new Error(`Output directory must be inside ${publicRoot}`)
  }

  const runtimePublicPath = `/${toPosixPath(runtimePath)}`

  if (!dryRun) {
    await mkdir(outputDir, { recursive: true })
    await convertToGlb({
      assetId,
      sourcePath,
      destinationPath,
      blenderScriptPath,
    })
  }

  return {
    assetId,
    status: dryRun ? 'planned' : 'imported',
    message: `${sourcePath} -> ${destinationPath}`,
    runtimePublicPath,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const manifestSource = await readFile(options.manifestPath, 'utf8')
  const allAssetIds = readAssetIds(manifestSource)
  const selectedAssetIds = options.only ?? allAssetIds
  const unknownAssetIds = selectedAssetIds.filter((assetId) => !allAssetIds.includes(assetId))

  if (unknownAssetIds.length > 0) {
    throw new Error(`Unknown asset ids: ${unknownAssetIds.join(', ')}`)
  }

  if (!existsSync(options.inputDir)) {
    throw new Error(`Input directory does not exist: ${options.inputDir}`)
  }

  if (!options.dryRun) {
    await mkdir(options.tempDir, { recursive: true })
  }

  let nextManifestSource = manifestSource
  const results = []

  for (const assetId of selectedAssetIds) {
    try {
      const result = await importAsset({
        assetId,
        inputDir: options.inputDir,
        outputDir: options.outputDir,
        tempDir: options.tempDir,
        dryRun: options.dryRun,
        blenderScriptPath: options.blenderScriptPath ?? DEFAULTS.blenderScriptPath,
      })

      results.push(result)

      if (result.runtimePublicPath) {
        nextManifestSource = updateManifestEntry(nextManifestSource, assetId, result.runtimePublicPath)
      }
    } catch (error) {
      results.push({
        assetId,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (!options.dryRun && nextManifestSource !== manifestSource) {
    await writeFile(options.manifestPath, nextManifestSource)
  }

  if (!options.keepTemp && !options.dryRun) {
    await rm(options.tempDir, { recursive: true, force: true })
  }

  for (const result of results) {
    console.log(`[${result.status}] ${result.assetId}: ${result.message}`)
  }

  const hasErrors = results.some((result) => result.status === 'error')
  if (hasErrors) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
