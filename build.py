#!/usr/bin/python

# INFORMATION:
# This scripts compiles the original Unicorn framework to JavaScript

import os
import shutil
import stat

EXPORTED_FUNCTIONS = [
    '_uc_open',
    '_uc_close',
]

# Directories
UNICORN_DIR = os.path.abspath("unicorn")
UNICORN_QEMU_DIR = os.path.join(UNICORN_DIR, "qemu")
ORIGINAL_QEMU_DIR = os.path.abspath("externals/qemu-2.2.1")

#############
# Utilities #
#############

# Replace strings in files
def replace(path, replacements):
    pathBak = path + ".bak"
    if os.path.exists(pathBak):
        return
    shutil.move(path, pathBak)
    fin = open(pathBak, "rt")
    fout = open(path, "wt")
    for line in fin:
        for string in replacements:
            line = line.replace(string, replacements[string])
        fout.write(line)
    fin.close()
    fout.close()

# Insert strings in files after a specific line
def insert(path, match, strings):
    pathBak = path + ".bak"
    if os.path.exists(pathBak):
        return
    shutil.move(path, pathBak)
    fin = open(pathBak, "rt")
    fout = open(path, "wt")
    for line in fin:
        fout.write(line)
        if match.strip() == line.strip():
            for string in strings:
                fout.write(string + "\n")
    fin.close()
    fout.close()

# Copy directory contents to another folder without overwriting files
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


############
# Patching #
############

def patchUnicornQemuTCI():
    """
    Patches Unicorn's QEMU fork to add the TCG Interpreter backend
    """
    # Enable TCI
    replace(os.path.join(UNICORN_QEMU_DIR, "configure"), {
        "tcg_interpreter=\"no\"": "tcg_interpreter=\"yes\""
    })
    # Add executable permissions for the new configure file
    path = os.path.join(UNICORN_QEMU_DIR, "configure")
    st = os.stat(path)
    os.chmod(path, st.st_mode | stat.S_IEXEC)
    # Copy missing TCI source files and patch them with Unicorn updates
    copytree(ORIGINAL_QEMU_DIR, UNICORN_QEMU_DIR)
    replace(os.path.join(UNICORN_QEMU_DIR, "tcg/tci/tcg-target.c"), {
        "tcg_target_available_regs": "s->tcg_target_available_regs",
        "tcg_target_call_clobber_regs": "s->tcg_target_call_clobber_regs",
        "tcg_add_target_add_op_defs(": "tcg_add_target_add_op_defs(s, ",
    })
    replace(os.path.join(UNICORN_QEMU_DIR, "tcg/tci/tcg-target.h"), {
        "#define tcg_qemu_tb_exec": "//#define tcg_qemu_tb_exec",
    })
    # Add TCI to Makefile.targets
    insert(os.path.join(UNICORN_QEMU_DIR, "Makefile.target"),
        "obj-y += tcg/tcg.o tcg/optimize.o", [
            "obj-$(CONFIG_TCG_INTERPRETER) += tci.o"
        ]
    )
    # Add TCI symbols
    insert(os.path.join(UNICORN_QEMU_DIR, "header_gen.py"),
        "symbols = (", [
            "    'tci_tb_ptr',",
            "    'tcg_qemu_tb_exec',",
        ]
    )
    # Update platform headers with new symbols
    cmd = "bash -c \"cd " + UNICORN_QEMU_DIR + " && ./gen_all_header.sh\""
    os.system(cmd)

def patchUnicornQemuJS():
    """
    Patches Unicorn's QEMU fork to enable compilation to JavaScript
    """
    return


############
# Building #
############

def compileUnicorn():
    # Patching Unicorn's QEMU fork
    patchUnicornQemuTCI()
    patchUnicornQemuJS()

    # TODO: Use --cpu=unknown flag for QEMU's configure, can be passed via: `UNICORN_QEMU_FLAGS="--cpu=unknown" ./make.sh`.
    return
    
    # CMake
    cmd = 'cmake'
    cmd += os.path.expandvars(' -DCMAKE_TOOLCHAIN_FILE=$EMSCRIPTEN/cmake/Modules/Platform/Emscripten.cmake')
    cmd += ' -DCMAKE_BUILD_TYPE=Release'
    cmd += ' -DBUILD_SHARED_LIBS=OFF'
    cmd += ' -DCMAKE_CXX_FLAGS="-Os"'
    if os.name == 'nt':
        cmd += ' -DMINGW=ON'
        cmd += ' -G \"MinGW Makefiles\"'
    if os.name == 'posix':
        cmd += ' -G \"Unix Makefiles\"'
    cmd += ' unicorn/CMakeLists.txt'
    os.system(cmd)

    # MinGW (Windows) or Make (Linux/Unix)
    os.chdir('unicorn')
    if os.name == 'nt':
        os.system('mingw32-make')
    if os.name == 'posix':
        os.system('make')
    os.chdir('..')

    # Compile static library to JavaScript
    cmd = os.path.expandvars('$EMSCRIPTEN/emcc')
    cmd += ' -Os --memory-init-file 0'
    cmd += ' unicorn/libunicorn.a'
    cmd += ' -s EXPORTED_FUNCTIONS=\"[\''+ '\', \''.join(EXPORTED_FUNCTIONS) +'\']\"'
    cmd += ' -o src/unicorn.out.js'
    os.system(cmd)


if __name__ == "__main__":
    if os.name in ['nt', 'posix']:
        compileUnicorn()
    else:
        print "Your operating system is not supported by this script:"
        print "Please, use Emscripten to compile Unicorn manually to src/unicorn.out.js"
