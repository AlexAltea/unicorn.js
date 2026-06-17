#!/usr/bin/env python3

import os
import glob
import json
import re
import shutil
import stat
import subprocess
import sys
import zipfile

EXPORTED_FUNCTIONS = [
    '_free',
    '_malloc',
    '_uc_arch_supported',
    '_uc_close',
    '_uc_context_alloc',
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

# Unicorn per-architecture public headers and the C macro prefix to export from
# each. Adapted from capstone.js (which adapted it from Unicorn's
# bindings/const_generator.py): each header is parsed into src/constants_<name>.js,
# with every value resolved to a plain integer. The leading `UC_` is dropped on
# output, so e.g. UC_ARM_REG_R0 -> ARM_REG_R0, matching the names the public API
# uses (uc.ARM_REG_R0).
#
# The cross-architecture constants (UC_ARCH/MODE/ERR/MEM/HOOK/QUERY/PROT, ...) are
# small and stable, so — as in capstone.js's capstone-wrapper.js — they are kept
# by hand directly in src/unicorn-wrapper.js rather than generated here.
CONST_HEADERS = [
    ('arm.h',     'arm',    'UC_ARM_'),
    ('arm64.h',   'arm64',  'UC_ARM64_'),
    ('m68k.h',    'm68k',   'UC_M68K_'),
    ('mips.h',    'mips',   'UC_MIPS_'),
    ('sparc.h',   'sparc',  'UC_SPARC_'),
    ('x86.h',     'x86',    'UC_X86_'),
]

# Unicorn build-target names whose constants file is named differently.
TARGET_ALIASES = {
    'aarch64': 'arm64',
}

# Unicorn build-target architecture names (the values UNICORN_ARCHS accepts, see
# the unicorn submodule's Makefile). Used by --release to emit one single-arch
# bundle per architecture. Kept as build-target names (e.g. `aarch64`, resolved
# to the `arm64` constants via TARGET_ALIASES), so `--release` mirrors what a
# user would get from `build.py <arch>`.
AVAILABLE_ARCHITECTURES = [
    'arm', 'aarch64', 'm68k', 'mips', 'sparc', 'x86',
]

# Directories
UNICORN_DIR = os.path.abspath("unicorn")
UNICORN_INCLUDE_DIR = os.path.join(UNICORN_DIR, "include", "unicorn")
UNICORN_QEMU_DIR = os.path.join(UNICORN_DIR, "qemu")
ORIGINAL_QEMU_DIR = os.path.abspath("externals/qemu-2.2.1")


def generateConstants():
    """Generate src/constants_<name>.js from Unicorn's C headers (one per header).

    Each file is loaded into the module via Emscripten `--post-js` (see
    compileUnicorn) so it runs with `Module` in scope and merges its constants
    straight onto the module, which becomes the public `uc` object.

    Each header's `typedef enum` / `#define` constants are parsed and every value
    resolved to an integer, so enum aliases (e.g. `UC_ARM_REG_R13 = UC_ARM_REG_SP`)
    and expressions (e.g. `1 << 30`) collapse to plain integer literals. This is
    immune to the textual quirks of Unicorn's pre-generated Python bindings.
    """
    for header, name, prefix in CONST_HEADERS:
        content = open(os.path.join(UNICORN_INCLUDE_DIR, header)).read()
        # Strip C comments up front so values never collide with `//`/`/* */`.
        content = re.sub(r'/\*.*?\*/', ' ', content, flags=re.DOTALL)

        out = open('src/constants_%s.js' % name, 'w')
        out.write('// AUTO-GENERATED, DO NOT EDIT [%s]\n' % header)
        out.write('Object.assign(Module, {\n')
        values = {}    # running namespace for value resolution (full UC_ names)
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
                    continue  # not a `NAME` or `NAME = value` enumerator
                if len(fields) > 1 and fields[1] == '=':
                    rhs = ''.join(fields[2:])      # explicit value/alias/expression
                else:
                    rhs = str(count)               # implicit running enum value
                    count += 1
                try:
                    count = int(rhs) + 1
                except ValueError:
                    pass
                name_c = fields[0].strip()
                value = eval(rhs, None, values)    # resolve to integer
                exec('%s = %d' % (name_c, value), None, values)
                key = name_c[3:] if name_c.startswith('UC_') else name_c
                out.write('  %s: %d,\n' % (key, value))
        out.write('});\n')
        out.close()


def constant_files(archs):
    """Per-architecture constants files (constants_<arch>.js) to bundle.

    The cross-architecture constants are kept in src/unicorn-wrapper.js (always
    bundled), so this returns only per-architecture files: all of them for a full
    build, or just the selected architectures' for a targeted build.
    """
    wanted = None
    if archs:
        wanted = {TARGET_ALIASES.get(a.lower(), a.lower()) for a in archs}
    files = []
    for header, name, prefix in CONST_HEADERS:
        if wanted is not None and name not in wanted:
            continue
        files.append('src/constants_%s.js' % name)
    return files

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

# Append strings at the end of the file
def append(path, code):
    pathBak = path + ".bak"
    if os.path.exists(pathBak):
        return
    shutil.copy(path, pathBak)
    with open(path, 'a') as f:
        f.write(code)

# Prepend strings at the beginning of the file
def prepend(path, code):
    pathBak = path + ".bak"
    if os.path.exists(pathBak):
        return
    shutil.move(path, pathBak)
    fin = open(pathBak, 'r')
    fout = open(path, 'w')
    fout.write(code)
    fout.write(fin.read())
    fout.close()
    fin.close()

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

PATCH_HELPER_ADAPTER_PROTO = """
#define GEN_ADAPTER_ARGS \\
  uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5, \\
  uint32_t a6, uint32_t a7, uint32_t a8, uint32_t a9, uint32_t a10

#define GEN_ADAPTER_DECLARE(name) \\
    uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS);
"""

PATCH_HELPER_ADAPTER_GEN = """
// Compile-time dispatch
#define CAT(a, ...) PRIMITIVE_CAT(a, __VA_ARGS__)
#define PRIMITIVE_CAT(a, ...) a ## __VA_ARGS__

#define IIF(c) PRIMITIVE_CAT(IIF_, c)
#define IIF_0(t, ...) __VA_ARGS__
#define IIF_1(t, ...) t

#define PROBE(x) x, 1
#define CHECK(...) CHECK_N(__VA_ARGS__, 0)
#define CHECK_N(x, n, ...) n

// Void type detection
#define VOID_TYPE_void ()
#define VOID_TYPE_noreturn ()
#define VOID_PROBE(type)            VOID_PROBE_PROXY(VOID_TYPE_##type)
#define VOID_PROBE_PROXY(...)       VOID_PROBE_PRIMITIVE(__VA_ARGS__)
#define VOID_PROBE_PRIMITIVE(x)     VOID_PROBE_COMBINE_ x
#define VOID_PROBE_COMBINE_(...)    PROBE(~)
#define IS_VOID(type)               CHECK(VOID_PROBE(type))

// Global helper detection
#define GLOB_NAME_uc_tracecode ()
#define GLOB_NAME_div_i32 ()
#define GLOB_NAME_rem_i32 ()
#define GLOB_NAME_divu_i32 ()
#define GLOB_NAME_remu_i32 ()
#define GLOB_NAME_div_i64 ()
#define GLOB_NAME_rem_i64 ()
#define GLOB_NAME_divu_i64 ()
#define GLOB_NAME_remu_i64 ()
#define GLOB_NAME_shl_i64 ()
#define GLOB_NAME_shr_i64 ()
#define GLOB_NAME_sar_i64 ()
#define GLOB_NAME_mulsh_i64 ()
#define GLOB_NAME_muluh_i64 ()
#define GLOB_PROBE(name)            GLOB_PROBE_PROXY(GLOB_NAME_##name)
#define GLOB_PROBE_PROXY(...)       GLOB_PROBE_PRIMITIVE(__VA_ARGS__)
#define GLOB_PROBE_PRIMITIVE(x)     GLOB_PROBE_COMBINE_ x
#define GLOB_PROBE_COMBINE_(...)    PROBE(~)
#define IS_GLOB(name)               CHECK(GLOB_PROBE(name))

// Arguments
#define A1 (a1 | ((uint64_t)a2  << 32))
#define A2 (a3 | ((uint64_t)a4  << 32))
#define A3 (a5 | ((uint64_t)a6  << 32))
#define A4 (a7 | ((uint64_t)a8  << 32))
#define A5 (a9 | ((uint64_t)a10 << 32))
#define GEN_ADAPTER_ARGS \\
  uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5, \\
  uint32_t a6, uint32_t a7, uint32_t a8, uint32_t a9, uint32_t a10

// Adapter definition
#define GEN_ADAPTER_0_VOID(name) \\
    HELPER(name)(); return 0;
#define GEN_ADAPTER_0_NONVOID(name) \\
    return HELPER(name)();
#define GEN_ADAPTER_0_DEFINE(name, ret) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_0_VOID(name), GEN_ADAPTER_0_NONVOID(name)) \\
}

#define GEN_ADAPTER_1_VOID(name, t1) \\
    HELPER(name)((dh_ctype(t1))A1); return 0;
#define GEN_ADAPTER_1_NONVOID(name, t1) \\
    return HELPER(name)((dh_ctype(t1))A1);
#define GEN_ADAPTER_1_DEFINE(name, ret, t1) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_1_VOID(name, t1), GEN_ADAPTER_1_NONVOID(name, t1)) \\
}

#define GEN_ADAPTER_2_VOID(name, t1, t2) \\
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2); return 0;
#define GEN_ADAPTER_2_NONVOID(name, t1, t2) \\
    return HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2);
#define GEN_ADAPTER_2_DEFINE(name, ret, t1, t2) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_2_VOID(name, t1, t2), GEN_ADAPTER_2_NONVOID(name, t1, t2)) \\
}

#define GEN_ADAPTER_3_VOID(name, t1, t2, t3) \\
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3); return 0;
#define GEN_ADAPTER_3_NONVOID(name, t1, t2, t3) \\
    return HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3);
#define GEN_ADAPTER_3_DEFINE(name, ret, t1, t2, t3) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_3_VOID(name, t1, t2, t3), GEN_ADAPTER_3_NONVOID(name, t1, t2, t3)) \\
}

#define GEN_ADAPTER_4_VOID(name, t1, t2, t3, t4) \\
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4); return 0;
#define GEN_ADAPTER_4_NONVOID(name, t1, t2, t3, t4) \\
    return HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4);
#define GEN_ADAPTER_4_DEFINE(name, ret, t1, t2, t3, t4) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_4_VOID(name, t1, t2, t3, t4), GEN_ADAPTER_4_NONVOID(name, t1, t2, t3, t4)) \\
}

#define GEN_ADAPTER_5_VOID(name, t1, t2, t3, t4, t5) \\
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5); return 0;
#define GEN_ADAPTER_5_NONVOID(name, t1, t2, t3, t4, t5) \\
    return HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5);
#define GEN_ADAPTER_5_DEFINE(name, ret, t1, t2, t3, t4, t5) \\
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \\
    IIF(IS_VOID(ret)) (GEN_ADAPTER_5_VOID(name, t1, t2, t3, t4, t5), GEN_ADAPTER_5_NONVOID(name, t1, t2, t3, t4, t5)) \\
}

#define GEN_ADAPTER_BLANK
#ifdef GEN_ADAPTER_DEFINE
#define GEN_ADAPTER_0(name, ret) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_0_DEFINE(name, ret))
#define GEN_ADAPTER_1(name, ret, t1) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_1_DEFINE(name, ret, t1))
#define GEN_ADAPTER_2(name, ret, t1, t2) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_2_DEFINE(name, ret, t1, t2))
#define GEN_ADAPTER_3(name, ret, t1, t2, t3) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_3_DEFINE(name, ret, t1, t2, t3))
#define GEN_ADAPTER_4(name, ret, t1, t2, t3, t4) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_4_DEFINE(name, ret, t1, t2, t3, t4))
#define GEN_ADAPTER_5(name, ret, t1, t2, t3, t4, t5) \\
    IIF(IS_GLOB(name)) (GEN_ADAPTER_BLANK, GEN_ADAPTER_5_DEFINE(name, ret, t1, t2, t3, t4, t5))
#else
#define GEN_ADAPTER_0(name, ret) GEN_ADAPTER_BLANK
#define GEN_ADAPTER_1(name, ret, t1) GEN_ADAPTER_BLANK
#define GEN_ADAPTER_2(name, ret, t1, t2) GEN_ADAPTER_BLANK
#define GEN_ADAPTER_3(name, ret, t1, t2, t3) GEN_ADAPTER_BLANK
#define GEN_ADAPTER_4(name, ret, t1, t2, t3, t4) GEN_ADAPTER_BLANK
#define GEN_ADAPTER_5(name, ret, t1, t2, t3, t4, t5) GEN_ADAPTER_BLANK
#endif
"""

def patchUnicornTCI():
    """
    Patches Unicorn's QEMU fork to add the TCG Interpreter backend
    """
    # Enable TCI
    replace(os.path.join(UNICORN_QEMU_DIR, "configure"), {
        "strip_opt=\"yes\"": "strip_opt=\"yes\"\ntcg_interpreter=\"yes\"",
        "# XXX: suppress that": "if test \"$tcg_interpreter\" = \"yes\" ; then\n  echo \"CONFIG_TCG_INTERPRETER=y\" >> $config_host_mak\nfi\n# XXX: suppress that",
        "if test \"$ARCH\" = \"sparc64\" ; then": "if test \"$tcg_interpreter\" = \"yes\"; then\n  QEMU_INCLUDES=\"-I\\$(SRC_PATH)/tcg/tci $QEMU_INCLUDES\"\nelif test \"$ARCH\" = \"sparc64\" ; then"
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
    # Replace python with current sys.executable, e.g. python3
    replace(os.path.join(UNICORN_QEMU_DIR, "gen_all_header.sh"), {
        "python header_gen.py": sys.executable + " header_gen.py",
    })


def patchUnicornJS():
    """
    Patches Unicorn files to target JavaScript
    """
    replace(os.path.join(UNICORN_DIR, "Makefile"), {
        '	./configure --cc="${CC}" --extra-cflags="$(UNICORN_CFLAGS)" --target-list="$(UNICORN_TARGETS)" ${UNICORN_QEMU_FLAGS}':
        '	./configure --cc="${CC}" --extra-cflags="$(UNICORN_CFLAGS)" --target-list="$(UNICORN_TARGETS)" ${UNICORN_QEMU_FLAGS} --disable-stack-protector --cpu=i386',
        'python qemu/header_gen.py': sys.executable + ' qemu/header_gen.py',
    })
    # Fix Glib function pointer issues
    replace(os.path.join(UNICORN_QEMU_DIR, "glib_compat.c"), {
        "(GCompareDataFunc) compare_func) (l1->data, l2->data, user_data)":
            "(GCompareFunc) compare_func) (l1->data, l2->data)",
    })
    # Fix QEMU function pointer issues
    replace(os.path.join(UNICORN_QEMU_DIR, "include/exec/helper-proto.h"), {
        # Adapter helpers
        "#include <exec/helper-head.h>":
        "#include <exec/helper-head.h>\n" + PATCH_HELPER_ADAPTER_PROTO,
        # Declare adapters
        "#define DEF_HELPER_FLAGS_0(name, flags, ret) \\":"""
         #define DEF_HELPER_FLAGS_0(name, flags, ret) \\
         GEN_ADAPTER_DECLARE(name) \\""",
        "#define DEF_HELPER_FLAGS_1(name, flags, ret, t1) \\":"""
         #define DEF_HELPER_FLAGS_1(name, flags, ret, t1) \\
         GEN_ADAPTER_DECLARE(name) \\""",
        "#define DEF_HELPER_FLAGS_2(name, flags, ret, t1, t2) \\":"""
         #define DEF_HELPER_FLAGS_2(name, flags, ret, t1, t2) \\
         GEN_ADAPTER_DECLARE(name) \\""",
        "#define DEF_HELPER_FLAGS_3(name, flags, ret, t1, t2, t3) \\":"""
         #define DEF_HELPER_FLAGS_3(name, flags, ret, t1, t2, t3) \\
         GEN_ADAPTER_DECLARE(name) \\""",
        "#define DEF_HELPER_FLAGS_4(name, flags, ret, t1, t2, t3, t4) \\":"""
         #define DEF_HELPER_FLAGS_4(name, flags, ret, t1, t2, t3, t4) \\
         GEN_ADAPTER_DECLARE(name) \\""",
        "#define DEF_HELPER_FLAGS_5(name, flags, ret, t1, t2, t3, t4, t5) \\":"""
         #define DEF_HELPER_FLAGS_5(name, flags, ret, t1, t2, t3, t4, t5) \\
         GEN_ADAPTER_DECLARE(name) \\""",
    })
    replace(os.path.join(UNICORN_QEMU_DIR, "include/exec/helper-gen.h"), {
        # Adapter helpers
        "#include <exec/helper-head.h>":
        "#include <exec/helper-head.h>\n" + PATCH_HELPER_ADAPTER_GEN,
        # Generate calls to adapters instead
        "tcg_gen_callN(tcg_ctx, HELPER(name)":
        "tcg_gen_callN(tcg_ctx, glue(adapter_helper_, name)",
        # Define adapters
        "#define DEF_HELPER_FLAGS_0(name, flags, ret)                            \\":"""
         #define DEF_HELPER_FLAGS_0(name, flags, ret)                            \\
         GEN_ADAPTER_0(name, ret) \\""",
        "#define DEF_HELPER_FLAGS_1(name, flags, ret, t1)                        \\":"""
         #define DEF_HELPER_FLAGS_1(name, flags, ret, t1)                        \\
         GEN_ADAPTER_1(name, ret, t1) \\""",
        "#define DEF_HELPER_FLAGS_2(name, flags, ret, t1, t2)                    \\":"""
         #define DEF_HELPER_FLAGS_2(name, flags, ret, t1, t2)                    \\
         GEN_ADAPTER_2(name, ret, t1, t2) \\""",
        "#define DEF_HELPER_FLAGS_3(name, flags, ret, t1, t2, t3)                \\":"""
         #define DEF_HELPER_FLAGS_3(name, flags, ret, t1, t2, t3)                \\
         GEN_ADAPTER_3(name, ret, t1, t2, t3) \\""",
        "#define DEF_HELPER_FLAGS_4(name, flags, ret, t1, t2, t3, t4)            \\":"""
         #define DEF_HELPER_FLAGS_4(name, flags, ret, t1, t2, t3, t4)            \\
         GEN_ADAPTER_4(name, ret, t1, t2, t3, t4) \\""",
        "#define DEF_HELPER_FLAGS_5(name, flags, ret, t1, t2, t3, t4, t5)        \\":"""
         #define DEF_HELPER_FLAGS_5(name, flags, ret, t1, t2, t3, t4, t5)        \\
         GEN_ADAPTER_5(name, ret, t1, t2, t3, t4, t5) \\""",
    })
    replace(os.path.join(UNICORN_QEMU_DIR, "tcg-runtime.c"), {
        # Adapter helpers
        '#include "exec/helper-head.h"':
        '#include "exec/helper-head.h"\n' +
        PATCH_HELPER_ADAPTER_GEN,
        # Add uc_tracecode to globals
        '#include "tcg-runtime.h"':"""
        #undef DEF_HELPER_FLAGS_2
        #define DEF_HELPER_FLAGS_2(name, flags, ret, t1, t2) \\
            dh_ctype(ret) HELPER(name) (dh_ctype(t1), dh_ctype(t2)); \\
            uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS); \\
            GEN_ADAPTER_2_DEFINE(name, ret, t1, t2)
        #define DEF_HELPER_FLAGS_4(name, flags, ret, t1, t2, t3, t4) \\
            dh_ctype(ret) HELPER(name) (dh_ctype(t1), dh_ctype(t2), dh_ctype(t3), dh_ctype(t4)); \\
            uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS); \\
            GEN_ADAPTER_4_DEFINE(name, ret, t1, t2, t3, t4)
        DEF_HELPER_4(uc_tracecode, void, i32, i32, ptr, i64)
        #include "tcg-runtime.h"
        """,
    })
    replace(os.path.join(UNICORN_QEMU_DIR, "include/exec/helper-tcg.h"), {
        "HELPER(NAME)":
        "glue(adapter_helper_, NAME)"
    })
    # Add arch-suffixes to adapters
    header_gen_patched = False
    with open(os.path.join(UNICORN_QEMU_DIR, "header_gen.py"), 'r') as f:
        if 'adapter_' in f.read():
            header_gen_patched = True
    if header_gen_patched == False:
        os.remove(os.path.join(UNICORN_QEMU_DIR, "header_gen.py.bak"))
        replace(os.path.join(UNICORN_QEMU_DIR, "header_gen.py"), {
            '      print("#define %s %s_%s" %(s, s, arch))':
            '      print("#define %s %s_%s" %(s, s, arch))\n'
            '      if s.startswith("helper_"):\n'
            '          s = "adapter_" + s\n'
            '          print("#define %s %s_%s" %(s, s, arch))',
        })
    # Define adapters
    translate_pat = os.path.join(UNICORN_QEMU_DIR, "target-*/translate.c")
    for fpath in glob.glob(translate_pat):
        prepend(fpath, '#define GEN_ADAPTER_DEFINE\n')
    # Fix register allocation for arguments
    replace(os.path.join(UNICORN_QEMU_DIR, "tcg/tcg.c"), {
        "int is_64bit = ":
        "int is_64bit = 1;//",
        # Explicit casts of non-64bit arguments in tcg_gen_callN
        "sizemask = info->sizemask;":"""
         sizemask = info->sizemask;

         for (i = 0; i < nargs; i++) {
             int is_64bit = sizemask & (1 << (i+1)*2);
             if (!is_64bit) {
                 TCGv_i64 ext_arg = tcg_temp_new_i64(s);
                 TCGv_i64 orig = MAKE_TCGV_I64(args[i]);
                 tcg_gen_ext32u_i64(s, ext_arg, orig);
                 args[i] = GET_TCGV_I64(ext_arg);
             }
         }
        """
    })


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
    # Clean static library objects and re-generate headers
    subprocess.run(['make', 'clean'], cwd=UNICORN_DIR)
    subprocess.run(["sh", "gen_all_header.sh"], check=True, cwd=UNICORN_QEMU_DIR)

    # Build the static library
    jobs = os.cpu_count() or 1
    cmd = ['emmake', 'make', 'unicorn', f'-j{jobs}']
    env = os.environ.copy()
    env['UNICORN_DEBUG'] = 'no'
    env['UNICORN_SHARED'] = 'no'
    if archs:
        env['UNICORN_ARCHS'] = ' '.join(archs)
    subprocess.run(cmd, check=True, cwd=UNICORN_DIR, env=env)

    # Port the static library to JavaScript/WASM
    suffix = ('_' + '+'.join(archs)) if archs else ''
    methods = [
        'ccall', 'getValue', 'setValue',
        'addFunction', 'removeFunction', 'writeArrayToMemory',
    ]
    cmd = [
        'emcc',
        '-Os',
        'unicorn/libunicorn.a',
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
    patchUnicornTCI()
    patchUnicornJS()

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
