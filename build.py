#!/usr/bin/env python3

import json
import os
import re
import shutil
import subprocess
import sys
import zipfile

EXPORTED_FUNCTIONS = [
    '_free',
    '_malloc',
    '_uc_arch_supported',
    '_uc_close',
    '_uc_context_alloc',
    '_uc_context_free',
    '_uc_context_restore',
    '_uc_context_save',
    '_uc_emu_start',
    '_uc_emu_stop',
    '_uc_errno',
    '_uc_free',
    '_uc_hook_add',
    '_uc_hook_del',
    '_uc_mem_map_ptr',
    '_uc_mem_map',
    '_uc_mem_protect',
    '_uc_mem_read',
    '_uc_mem_regions',
    '_uc_mem_unmap',
    '_uc_mem_write',
    '_uc_open',
    '_uc_query',
    '_uc_reg_read_batch',
    '_uc_reg_read',
    '_uc_reg_write_batch',
    '_uc_reg_write',
    '_uc_strerror',
    '_uc_version',
]

AVAILABLE_ARCHITECTURES = [
    'arm', 'aarch64', 'm68k', 'mips', 'ppc', 'riscv', 's390x', 'sparc',
    'tricore', 'x86',
]

# Unicorn build-target names whose constants file is named differently.
TARGET_ALIASES = {
    'aarch64': 'arm64',
}

# Map a build-target arch to the (header, name, UC_ prefix) for its constants
def arch_constants(arch):
    name = TARGET_ALIASES.get(arch.lower(), arch.lower())
    return name + '.h', name, 'UC_%s_' % name.upper()

# Directories
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
UNICORN_DIR = os.path.join(ROOT_DIR, "unicorn")
UNICORN_INCLUDE_DIR = os.path.join(UNICORN_DIR, "include", "unicorn")
UNICORN_QEMU_DIR = os.path.join(UNICORN_DIR, "qemu")
UNICORN_BUILD_DIR = os.path.join(UNICORN_DIR, "build")
ORIGINAL_QEMU_DIR = os.path.join(ROOT_DIR, "externals/qemu-5.0.1")
HELPER_ADAPTER_SRC = os.path.join(ROOT_DIR, "src/qemu/helper-adapter.h")


def generateConstants():
    """Generate src/constants_<name>.js from Unicorn's C headers (one per header).

    Each file is loaded into the module via Emscripten `--post-js` (see
    compileUnicorn) so it runs with `Module` in scope and merges its constants
    straight onto the module, which becomes the public `uc` object.

    Each header's `typedef enum` / `#define` constants are parsed and every value
    resolved to an integer, so enum aliases (e.g. `UC_ARM_REG_R13 = UC_ARM_REG_SP`)
    and expressions (e.g. `1 << 30`, `UC_X86_REG_EIP + 2`) collapse to plain
    integer literals.
    """
    for arch in AVAILABLE_ARCHITECTURES:
        header, name, prefix = arch_constants(arch)
        content = open(os.path.join(UNICORN_INCLUDE_DIR, header)).read()
        # Strip C comments up front so values never collide with `//`/`/* */`.
        content = re.sub(r'/\*.*?\*/', ' ', content, flags=re.DOTALL)

        out = open('src/constants_%s.js' % name, 'w')
        out.write('// AUTO-GENERATED, DO NOT EDIT [%s]\n' % header)
        out.write('Object.assign(Module, {\n')
        values = {}  # running namespace for value resolution
        count = 0
        for line in content.splitlines():
            line = line.split('//', 1)[0].strip()
            if line == '':
                continue
            if line.startswith('#define '):
                fields = re.split(r'\s+', line[len('#define '):], 1)
                if len(fields) != 2 or '(' in fields[0] or ')' in fields[0]:
                    continue  # skip multi-token / function-like macros
                line = fields[0] + ' = ' + fields[1]
            if not line.startswith(prefix):
                continue

            for token in line.split(','):
                token = token.strip()
                if not token:
                    continue
                fields = re.split(r'\s+', token)
                if not fields[0].startswith(prefix):
                    continue
                if len(fields) > 1 and fields[1] != '=':
                    continue
                if len(fields) > 1 and fields[1] == '=':
                    rhs = ''.join(fields[2:])
                else:
                    rhs = str(count)
                name_c = fields[0].strip()
                value = eval(rhs, None, values)
                exec('%s = %d' % (name_c, value), None, values)
                count = value + 1
                key = name_c[3:] if name_c.startswith('UC_') else name_c
                out.write('  %s: %d,\n' % (key, value))
        out.write('});\n')
        out.close()


def constant_files(archs):
    """Per-arch constants files from generateConstants(), loaded via --post-js."""
    targets = archs if archs else AVAILABLE_ARCHITECTURES
    files = []
    for arch in targets:
        path = 'src/constants_%s.js' % arch_constants(arch)[1]
        if path not in files:
            files.append(path)
    return files

############
# Patching #
############

# Copy directory contents into another folder without overwriting existing files.
def copytree(src, dst, symlinks=False, ignore=None):
    if not os.path.exists(dst):
        os.makedirs(dst)
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            copytree(s, d, symlinks, ignore)
        elif not os.path.exists(d):
            shutil.copy2(s, d)


# Apply patch to repository via git apply (idempotent)
def apply_patch(repo, patch):
    patch_path = os.path.join(ROOT_DIR, patch)
    already = subprocess.run(
        ["git", "apply", "--reverse", "--check", patch_path],
        cwd=repo, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if already.returncode == 0:
        return
    subprocess.run(["git", "apply", patch_path], cwd=repo, check=True)


def patchUnicorn():
    # Re-add the TCG Interpreter (TCI) to Unicorn's QEMU 5.0.1 fork
    copytree(ORIGINAL_QEMU_DIR, UNICORN_QEMU_DIR)
    apply_patch(UNICORN_DIR, "src/patches/unicorn-tci.patch")

    # Wrap every TCG helper in an adapter a uniform call signature (no function casts in Emscripten)
    dst = os.path.join(UNICORN_QEMU_DIR, "include/exec/helper-adapter.h")
    if not os.path.exists(dst):
        shutil.copy2(HELPER_ADAPTER_SRC, dst)
    apply_patch(UNICORN_DIR, "src/patches/unicorn-adapters.patch")

    # Add missing PPC symbols
    apply_patch(UNICORN_DIR, "src/patches/unicorn-ppc-fix.patch")
    subprocess.run(["bash", "symbols.sh"], check=True, cwd=UNICORN_DIR)


############
# Building #
############

def package_build(suffix):
    """Zip the .js/.wasm pair into dist/unicorn{suffix}_{version}.zip."""
    version = json.load(open('package.json'))['version']
    zip_path = f'dist/unicorn{suffix}_{version}.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for path in (f'dist/unicorn{suffix}.js', f'dist/unicorn{suffix}.wasm'):
            zf.write(path, os.path.basename(path))


def compileUnicorn(archs=[], package=False):
    targets = archs if archs else AVAILABLE_ARCHITECTURES
    shutil.rmtree(UNICORN_BUILD_DIR, ignore_errors=True)

    # Configure with CMake
    subprocess.run([
        'emcmake', 'cmake',
        '-B', UNICORN_BUILD_DIR,
        '-S', UNICORN_DIR,
        '-DCMAKE_BUILD_TYPE=Release',
        '-DBUILD_SHARED_LIBS=OFF',
        '-DUNICORN_ARCH=' + ';'.join(targets),
        '-DUNICORN_BUILD_TESTS=OFF',
        '-DUNICORN_INSTALL=OFF',
        '-DUNICORN_FUZZ=OFF',
        '-DUNICORN_LEGACY_STATIC_ARCHIVE=ON',
    ], check=True)

    # Build the static library
    jobs = os.cpu_count() or 1
    cmd = ['emmake', 'cmake', '--build', UNICORN_BUILD_DIR, '--target', 'unicorn_archive', f'-j{jobs}']
    subprocess.run(cmd, check=True)

    # Port the static library to JavaScript/WASM
    suffix = ('_' + '+'.join(archs)) if archs else ''
    methods = [
        'ccall', 'getValue', 'setValue', 'addFunction', 'removeFunction', 'writeArrayToMemory'
    ]
    cmd = [
        'emcc',
        '-Os',
        os.path.join(UNICORN_BUILD_DIR, 'libunicorn.a'),
        '-s', f"EXPORTED_FUNCTIONS={EXPORTED_FUNCTIONS}",
        '-s', f"EXPORTED_RUNTIME_METHODS={methods}",
        '-s', 'RESERVED_FUNCTION_POINTERS=256',
        '-s', 'ALLOW_TABLE_GROWTH=1',
        '-s', 'ALLOW_MEMORY_GROWTH=1',
        '-s', 'MODULARIZE=1',
        '-s', 'WASM=1',
        '-s', 'WASM_BIGINT=1',
        '-s', "EXPORT_NAME='MUnicorn'",
    ]
    for path in constant_files(archs):
        cmd += ['--post-js', path]
    cmd += ['--post-js', 'src/unicorn-wrapper.js']
    cmd += ['-o', f'dist/unicorn{suffix}.js']
    os.makedirs('dist', exist_ok=True)
    subprocess.run(cmd, check=True)
    if package:
        package_build(suffix)


if __name__ == "__main__":
    # Initialize Unicorn submodule if necessary
    if not os.listdir(UNICORN_DIR):
        os.system("git submodule update --init")

    # Patch Unicorn submodule
    patchUnicorn()

    args = sys.argv[1:]
    package = '--package' in args
    release = '--release' in args
    generateConstants()
    if release:
        compileUnicorn([], package) # Build all
        for arch in AVAILABLE_ARCHITECTURES:
            compileUnicorn([arch], package)
    else:
        archs = sorted(a for a in args if not a.startswith('--'))
        compileUnicorn(archs, package)
