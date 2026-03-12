export const delayImport = async <T>(loader: Promise<T>, delayMs: number) => {
  const [moduleExports] = await Promise.all([
    loader,
    new Promise((resolve) => window.setTimeout(resolve, delayMs)),
  ])

  return moduleExports
}
