#!/usr/bin/python

# INFORMATION:
# This scripts compiles the original Unicorn framework to JavaScript

import os
import glob
import shutil
import stat
import sys

EXPORTED_FUNCTIONS = [
    '_uc_version',
    '_uc_arch_supported',
    '_uc_open',
    '_uc_close',
    '_uc_query',
    '_uc_errno',
    '_uc_strerror',
    '_uc_reg_write',
    '_uc_reg_read',
    '_uc_reg_write_batch',
    '_uc_reg_read_batch',
    '_uc_mem_write',
    '_uc_mem_read',
    '_uc_emu_start',
    '_uc_emu_stop',
    '_uc_hook_add',
    '_uc_hook_del',
    '_uc_mem_map',
    '_uc_mem_map_ptr',
    '_uc_mem_unmap',
    '_uc_mem_protect',
    '_uc_mem_regions',
    '_uc_context_alloc',
    '_uc_free',
    '_uc_context_save',
    '_uc_context_restore',
]

EXPORTED_CONSTANTS = [
    'bindings/python/unicorn/arm64_const.py',
    'bindings/python/unicorn/arm_const.py',
    'bindings/python/unicorn/m68k_const.py',
    'bindings/python/unicorn/mips_const.py',
    'bindings/python/unicorn/sparc_const.py',
    'bindings/python/unicorn/x86_const.py',
    'bindings/python/unicorn/unicorn_const.py',
    'bindings/python/unicorn/arm64_const.py',
]

# Directories
UNICORN_DIR = os.path.abspath("unicorn")
UNICORN_QEMU_DIR = os.path.join(UNICORN_DIR, "qemu")
ORIGINAL_QEMU_DIR = os.path.abspath("externals/qemu-2.2.1")

def generateConstants():
    out = open('src/unicorn-constants.js', 'w')
    for path in EXPORTED_CONSTANTS:
        path = os.path.join(UNICORN_DIR, path)
        with open(path, 'r') as f:
            code = f.read()
            code = code.replace('\nUC_', '\nuc.')
            code = code.replace('#', '//')
        out.write(code)
    out.close()

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

REPLACE_OBJECTS = """
import re, glob, shutil
path = 'qemu/*softmmu/**/*.o'
for d in xrange(5):
    for f in glob.glob(path.replace('/**', '/*' * d)):
        f = f.replace('\\\\', '/')
        m = re.match(r'qemu\/([0-9A-Za-z_]+)\-softmmu.*', f)
        shutil.move(f, f[:-2] + '-' + m.group(1) + '.o')
"""

PATCH_UNALIGNED_MEMACCESS = """
#define UNALIGNED_READ16_LE(addr) ( \\
    ((uint16_t)(*((uint8_t*)(addr) + 0)) <<  0) |  \\
    ((uint16_t)(*((uint8_t*)(addr) + 1)) <<  8)    \\
)

#define UNALIGNED_READ32_LE(addr) ( \\
    ((uint32_t)(*((uint8_t*)(addr) + 0)) <<  0) |  \\
    ((uint32_t)(*((uint8_t*)(addr) + 1)) <<  8) |  \\
    ((uint32_t)(*((uint8_t*)(addr) + 2)) << 16) |  \\
    ((uint32_t)(*((uint8_t*)(addr) + 3)) << 24)    \\
)

#define UNALIGNED_READ64_LE(addr) ( \\
    ((uint64_t)(*((uint8_t*)(addr) + 0)) <<  0) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 1)) <<  8) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 2)) << 16) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 3)) << 24) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 4)) << 32) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 5)) << 40) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 6)) << 48) |  \\
    ((uint64_t)(*((uint8_t*)(addr) + 7)) << 56)    \\
)

#define UNALIGNED_WRITE16_LE(addr, value) { \\
    *((uint8_t*)(addr) + 0) = ((value) >>  0) & 0xFF; \\
    *((uint8_t*)(addr) + 1) = ((value) >>  8) & 0xFF; \\
}

#define UNALIGNED_WRITE32_LE(addr, value) { \\
    *((uint8_t*)(addr) + 0) = ((value) >>  0) & 0xFF; \\
    *((uint8_t*)(addr) + 1) = ((value) >>  8) & 0xFF; \\
    *((uint8_t*)(addr) + 2) = ((value) >> 16) & 0xFF; \\
    *((uint8_t*)(addr) + 3) = ((value) >> 24) & 0xFF; \\
}

#define UNALIGNED_WRITE64_LE(addr, value) { \\
    *((uint8_t*)(addr) + 0) = ((value) >>  0) & 0xFF; \\
    *((uint8_t*)(addr) + 1) = ((value) >>  8) & 0xFF; \\
    *((uint8_t*)(addr) + 2) = ((value) >> 16) & 0xFF; \\
    *((uint8_t*)(addr) + 3) = ((value) >> 24) & 0xFF; \\
    *((uint8_t*)(addr) + 4) = ((value) >> 32) & 0xFF; \\
    *((uint8_t*)(addr) + 5) = ((value) >> 40) & 0xFF; \\
    *((uint8_t*)(addr) + 6) = ((value) >> 48) & 0xFF; \\
    *((uint8_t*)(addr) + 7) = ((value) >> 56) & 0xFF; \\
}
"""

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


def patchUnicornJS():
    """
    Patches Unicorn files to target JavaScript
    """
    # Disable unnecessary options
    replace(os.path.join(UNICORN_DIR, "config.mk"), {
        "UNICORN_DEBUG ?= yes": "UNICORN_DEBUG ?= no",
        "UNICORN_SHARED ?= yes": "UNICORN_SHARED ?= no",
    })
    # Ensure QEMU's object files have different base names
    name = "rename_objects.py"
    with open(os.path.join(UNICORN_DIR, name), "wt") as f:
        f.write(REPLACE_OBJECTS)
    replace(os.path.join(UNICORN_DIR, "Makefile"), {
        "$(MAKE) -C qemu $(SMP_MFLAGS)":
        "$(MAKE) -C qemu $(SMP_MFLAGS)\r\n\t@python " + name,
    })
    # Replace sigsetjmp/siglongjump with setjmp/longjmp
    replace(os.path.join(UNICORN_QEMU_DIR, "cpu-exec.c"), {
        "sigsetjmp(cpu->jmp_env, 0)": "setjmp(cpu->jmp_env)",
        "siglongjmp(cpu->jmp_env, 1)": "longjmp(cpu->jmp_env, 1)",
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
        "func = HELPER(NAME)":
        "func = glue(adapter_helper_, NAME)"
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
                 TCGArg ext_arg = tcg_temp_new_i64(s);
                 tcg_gen_ext32u_i64(s, ext_arg, args[i]);
                 args[i] = GET_TCGV_I64(ext_arg);
             }
         }
        """
    })
    # Fix unaligned reads
    append(os.path.join(UNICORN_QEMU_DIR, "include/qemu-common.h"),
        PATCH_UNALIGNED_MEMACCESS)
    replace(os.path.join(UNICORN_QEMU_DIR, "include/exec/exec-all.h"), {
        "    *(uint32_t *)jmp_addr = addr - (jmp_addr + 4);":
        "    UNALIGNED_WRITE32_LE(jmp_addr, addr - (jmp_addr + 4));"
    })
    replace(os.path.join(UNICORN_QEMU_DIR, "tci.c"), {
        "*(tcg_target_ulong *)(*tb_ptr)":
        "UNALIGNED_READ32_LE(*tb_ptr)",
        "*(uint32_t *)(*tb_ptr)":
        "UNALIGNED_READ32_LE(*tb_ptr)",
        "*(int32_t *)(*tb_ptr)":
        "UNALIGNED_READ32_LE(*tb_ptr)",
        "*(uint64_t *)tb_ptr":
        "UNALIGNED_READ64_LE(tb_ptr)",
        # Stores
        "*(uint16_t *)(t1 + t2) = t0":
        "UNALIGNED_WRITE16_LE(t1 + t2, t0)",
        "*(uint32_t *)(t1 + t2) = t0":
        "UNALIGNED_WRITE32_LE(t1 + t2, t0)",
        "*(uint64_t *)(t1 + t2) = t0":
        "UNALIGNED_WRITE64_LE(t1 + t2, t0)",
        # Loads
        "*(uint32_t *)(t1 + t2)":
        "UNALIGNED_READ32_LE(t1 + t2)",
        "*(uint64_t *)(t1 + t2)":
        "UNALIGNED_READ64_LE(t1 + t2)",
        "*(int32_t *)(t1 + t2)":
        "(int32_t)UNALIGNED_READ32_LE(t1 + t2)",
    })
    # Fix unsupported varargs in uc_hook_add function signature
    replace(os.path.join(UNICORN_DIR, "include/unicorn/unicorn.h"), {
        "        void *user_data, uint64_t begin, uint64_t end, ...);":
        "        void *user_data, uint64_t begin, uint64_t end, uint32_t extra);",
    })
    replace(os.path.join(UNICORN_DIR, "uc.c"), {
        "        uc_err err = uc_hook_add(uc, &uc->count_hook, UC_HOOK_CODE, hook_count_cb, NULL, 1, 0);":
        "        uc_err err = uc_hook_add(uc, &uc->count_hook, UC_HOOK_CODE, hook_count_cb, NULL, 1, 0, 0);",
        "        void *user_data, uint64_t begin, uint64_t end, ...)":
        "        void *user_data, uint64_t begin, uint64_t end, uint32_t extra)",
        "        va_list valist;":
        "        //va_list valist;",
        "        va_start(valist, end);":
        "        //va_start(valist, end);",
        "        hook->insn = va_arg(valist, int);":
        "        hook->insn = extra;",
        "        va_end(valist);":
        "        //va_end(valist);",
    })


############
# Building #
############

def compileUnicorn(targets):
    # Patching Unicorn's QEMU fork
    patchUnicornTCI()
    patchUnicornJS()

    # Emscripten: Make
    os.chdir('unicorn')
    os.system('make clean')
    if os.name == 'posix':
        cmd = ''
        if targets:
            cmd += 'UNICORN_ARCHS="%s" ' % (' '.join(targets))
        cmd += 'emmake make unicorn'
        os.system(cmd)
    os.chdir('..')

    # Compile static library to JavaScript
    methods = ['_malloc', 'ccall', 'getValue', 'setValue', 'addFunction', 'removeFunction', 'writeArrayToMemory']
    cmd = 'emcc'
    cmd += ' -Os --memory-init-file 0'
    cmd += ' unicorn/libunicorn.a'
    cmd += ' -s EXPORTED_FUNCTIONS=\"[\''+ '\', \''.join(EXPORTED_FUNCTIONS) +'\']\"'
    cmd += ' -s EXTRA_EXPORTED_RUNTIME_METHODS=\"[\''+ '\', \''.join(methods) +'\']\"'
    cmd += ' -s RESERVED_FUNCTION_POINTERS=256'
    cmd += ' -s ALLOW_MEMORY_GROWTH=1'
    cmd += ' -s MODULARIZE=1'
    cmd += ' -s WASM=1'
    cmd += ' -s EXPORT_NAME="\'MUnicorn\'"'
    if targets:
        cmd += ' -o src/libunicorn-%s.out.js' % ('-'.join(targets))
    else:
        cmd += ' -o src/libunicorn.out.js'
    os.system(cmd)


def exit_usage():
    print("Usage: %s <action> [<targets>...]\n" % (sys.argv[0]))
    print("List of actions:")
    print(" - patch: Patch Unicorn only")
    print(" - build: Patch Unicorn and build Unicorn.js")
    exit(1)

if __name__ == "__main__":
    # Initialize Unicorn submodule if necessary
    if not os.listdir(UNICORN_DIR):
        os.system("git submodule update --init")
    # Compile Unicorn
    if len(sys.argv) < 2:
        exit_usage()
    action = sys.argv[1]
    if action == 'patch':
        patchUnicornTCI()
        patchUnicornJS()
    elif action == 'build':
        patchUnicornTCI()
        patchUnicornJS()
        targets = sorted(sys.argv[2:])
        if os.name in ['posix']:
            generateConstants()
            compileUnicorn(targets)
        else:
            print("Your operating system is not supported by this script:")
            print("Please, use Emscripten to compile Unicorn manually to src/libunicorn.out.js")
    else:
        exit_usage()
