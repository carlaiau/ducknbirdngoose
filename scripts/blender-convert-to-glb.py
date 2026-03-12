import bpy
import os
import sys


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for block_collection in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.armatures):
        for block in list(block_collection):
            if block.users == 0:
                block_collection.remove(block)


def import_model(source_path):
    extension = os.path.splitext(source_path)[1].lower()

    if extension == '.fbx':
        bpy.ops.import_scene.fbx(filepath=source_path)
        return

    if extension == '.obj':
        if hasattr(bpy.ops.wm, 'obj_import'):
            bpy.ops.wm.obj_import(filepath=source_path)
        else:
            bpy.ops.import_scene.obj(filepath=source_path)
        return

    if extension in {'.gltf', '.glb'}:
        bpy.ops.import_scene.gltf(filepath=source_path)
        return

    raise ValueError(f'Unsupported import format: {extension}')


def main():
    if '--' not in sys.argv:
        raise ValueError('Expected source and destination paths after "--"')

    args = sys.argv[sys.argv.index('--') + 1 :]
    if len(args) != 2:
        raise ValueError('Expected exactly two arguments: <source> <destination>')

    source_path, destination_path = args

    clear_scene()
    import_model(source_path)

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    bpy.ops.export_scene.gltf(
        filepath=destination_path,
        export_format='GLB',
        export_yup=True,
    )


if __name__ == '__main__':
    main()
