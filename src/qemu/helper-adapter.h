/*
 * Unicorn.js: TCG-helper "adapter" machinery for the WASM/TCI target.
 *
 * The TCG interpreter (tci.c, INDEX_op_call) invokes EVERY helper through one
 * fixed function-pointer type:
 *
 *     typedef uint64_t (*helper_function)(tcg_target_ulong x12);   // wasm32
 *
 * On a native host calling a real helper through this wider/uniform prototype
 * is harmless, but WebAssembly's call_indirect traps unless the table entry's
 * signature matches the call site exactly ("null function or function signature
 * mismatch"). So for each helper we generate an "adapter" with that exact
 * uniform signature which reconstructs the real arguments and calls the real
 * helper. The adapter (not the helper) is what gets registered as the call
 * target (see helper-gen.h / helper-tcg.h) and stored in the TB.
 *
 * Under wasm32 (TCG_TARGET_REG_BITS == 32, MAX_OPC_PARAM_IARGS == 6) each of the
 * up-to-6 logical 64-bit arguments is passed as a (lo, hi) pair of 32-bit words,
 * so the uniform signature takes 12 uint32_t. tcg_gen_callN() is patched to
 * zero-extend narrow args and always emit them as pairs, so A1..A6 below
 * reconstruct each logical argument faithfully.
 */

#ifndef HELPER_ADAPTER_H
#define HELPER_ADAPTER_H

/* The uniform adapter argument list: 6 logical 64-bit args = 12 x uint32_t. */
#define GEN_ADAPTER_ARGS \
  uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5,  uint32_t a6, \
  uint32_t a7, uint32_t a8, uint32_t a9, uint32_t a10, uint32_t a11, uint32_t a12

/* Declaration emitted in helper-proto.h for every DEF_HELPER. */
#define GEN_ADAPTER_DECLARE(name) \
    uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS);

/* Reconstruct each logical 64-bit argument from its (lo, hi) word pair. */
#define A1 (a1  | ((uint64_t)a2  << 32))
#define A2 (a3  | ((uint64_t)a4  << 32))
#define A3 (a5  | ((uint64_t)a6  << 32))
#define A4 (a7  | ((uint64_t)a8  << 32))
#define A5 (a9  | ((uint64_t)a10 << 32))
#define A6 (a11 | ((uint64_t)a12 << 32))

/* Compile-time dispatch helpers. */
#define UC_CAT(a, ...) UC_PRIMITIVE_CAT(a, __VA_ARGS__)
#define UC_PRIMITIVE_CAT(a, ...) a ## __VA_ARGS__
#define UC_IIF(c) UC_PRIMITIVE_CAT(UC_IIF_, c)
#define UC_IIF_0(t, ...) __VA_ARGS__
#define UC_IIF_1(t, ...) t
#define UC_PROBE(x) x, 1
#define UC_CHECK(...) UC_CHECK_N(__VA_ARGS__, 0)
#define UC_CHECK_N(x, n, ...) n

/* Detect helpers whose return type is void / noreturn (adapter returns 0). */
#define UC_VOID_TYPE_void ()
#define UC_VOID_TYPE_noreturn ()
#define UC_VOID_PROBE(type)         UC_VOID_PROBE_PROXY(UC_VOID_TYPE_##type)
#define UC_VOID_PROBE_PROXY(...)    UC_VOID_PROBE_PRIMITIVE(__VA_ARGS__)
#define UC_VOID_PROBE_PRIMITIVE(x)  UC_VOID_PROBE_COMBINE_ x
#define UC_VOID_PROBE_COMBINE_(...) UC_PROBE(~)
#define UC_IS_VOID(type)            UC_CHECK(UC_VOID_PROBE(type))

/* Detect helpers whose return type is a pointer (ptr/cptr): these must be
 * converted to the uint64_t result through uintptr_t, since a direct
 * pointer->uint64_t cast is an error under -Wint-conversion on wasm32. */
#define UC_PTR_TYPE_ptr ()
#define UC_PTR_TYPE_cptr ()
#define UC_PTR_PROBE(type)          UC_PTR_PROBE_PROXY(UC_PTR_TYPE_##type)
#define UC_PTR_PROBE_PROXY(...)     UC_PTR_PROBE_PRIMITIVE(__VA_ARGS__)
#define UC_PTR_PROBE_PRIMITIVE(x)   UC_PTR_PROBE_COMBINE_ x
#define UC_PTR_PROBE_COMBINE_(...)  UC_PROBE(~)
#define UC_IS_PTR(type)             UC_CHECK(UC_PTR_PROBE(type))

/* Convert a helper return value (of dh_ctype(ret)) to the uint64_t the adapter
 * must return: pointers go via uintptr_t, everything else casts directly. */
#define UC_RET_TO_U64(ret, expr) \
    UC_IIF(UC_IS_PTR(ret)) ((uint64_t)(uintptr_t)(expr), (uint64_t)(expr))

/* Adapter bodies: call the real helper with reconstructed args. */
#define GEN_ADAPTER_0_VOID(name) \
    HELPER(name)(); return 0;
#define GEN_ADAPTER_0_NONVOID(name, ret) \
    return UC_RET_TO_U64(ret, HELPER(name)());
#define GEN_ADAPTER_0_DEFINE(name, ret) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_0_VOID(name), GEN_ADAPTER_0_NONVOID(name, ret)) \
}

#define GEN_ADAPTER_1_VOID(name, t1) \
    HELPER(name)((dh_ctype(t1))A1); return 0;
#define GEN_ADAPTER_1_NONVOID(name, ret, t1) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1));
#define GEN_ADAPTER_1_DEFINE(name, ret, t1) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_1_VOID(name, t1), GEN_ADAPTER_1_NONVOID(name, ret, t1)) \
}

#define GEN_ADAPTER_2_VOID(name, t1, t2) \
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2); return 0;
#define GEN_ADAPTER_2_NONVOID(name, ret, t1, t2) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2));
#define GEN_ADAPTER_2_DEFINE(name, ret, t1, t2) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_2_VOID(name, t1, t2), GEN_ADAPTER_2_NONVOID(name, ret, t1, t2)) \
}

#define GEN_ADAPTER_3_VOID(name, t1, t2, t3) \
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3); return 0;
#define GEN_ADAPTER_3_NONVOID(name, ret, t1, t2, t3) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3));
#define GEN_ADAPTER_3_DEFINE(name, ret, t1, t2, t3) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_3_VOID(name, t1, t2, t3), GEN_ADAPTER_3_NONVOID(name, ret, t1, t2, t3)) \
}

#define GEN_ADAPTER_4_VOID(name, t1, t2, t3, t4) \
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4); return 0;
#define GEN_ADAPTER_4_NONVOID(name, ret, t1, t2, t3, t4) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4));
#define GEN_ADAPTER_4_DEFINE(name, ret, t1, t2, t3, t4) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_4_VOID(name, t1, t2, t3, t4), GEN_ADAPTER_4_NONVOID(name, ret, t1, t2, t3, t4)) \
}

#define GEN_ADAPTER_5_VOID(name, t1, t2, t3, t4, t5) \
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5); return 0;
#define GEN_ADAPTER_5_NONVOID(name, ret, t1, t2, t3, t4, t5) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5));
#define GEN_ADAPTER_5_DEFINE(name, ret, t1, t2, t3, t4, t5) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_5_VOID(name, t1, t2, t3, t4, t5), GEN_ADAPTER_5_NONVOID(name, ret, t1, t2, t3, t4, t5)) \
}

#define GEN_ADAPTER_6_VOID(name, t1, t2, t3, t4, t5, t6) \
    HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5, (dh_ctype(t6))A6); return 0;
#define GEN_ADAPTER_6_NONVOID(name, ret, t1, t2, t3, t4, t5, t6) \
    return UC_RET_TO_U64(ret, HELPER(name)((dh_ctype(t1))A1, (dh_ctype(t2))A2, (dh_ctype(t3))A3, (dh_ctype(t4))A4, (dh_ctype(t5))A5, (dh_ctype(t6))A6));
#define GEN_ADAPTER_6_DEFINE(name, ret, t1, t2, t3, t4, t5, t6) \
uint64_t glue(adapter_helper_, name)(GEN_ADAPTER_ARGS) { \
    UC_IIF(UC_IS_VOID(ret)) (GEN_ADAPTER_6_VOID(name, t1, t2, t3, t4, t5, t6), GEN_ADAPTER_6_NONVOID(name, ret, t1, t2, t3, t4, t5, t6)) \
}

/* When GEN_ADAPTER_DEFINE is set (in each translate.c), GEN_ADAPTER_N expands to
 * an adapter definition; elsewhere it expands to nothing. */
#define GEN_ADAPTER_BLANK
#ifdef GEN_ADAPTER_DEFINE
#define GEN_ADAPTER_0(name, ret)                         GEN_ADAPTER_0_DEFINE(name, ret)
#define GEN_ADAPTER_1(name, ret, t1)                     GEN_ADAPTER_1_DEFINE(name, ret, t1)
#define GEN_ADAPTER_2(name, ret, t1, t2)                 GEN_ADAPTER_2_DEFINE(name, ret, t1, t2)
#define GEN_ADAPTER_3(name, ret, t1, t2, t3)             GEN_ADAPTER_3_DEFINE(name, ret, t1, t2, t3)
#define GEN_ADAPTER_4(name, ret, t1, t2, t3, t4)         GEN_ADAPTER_4_DEFINE(name, ret, t1, t2, t3, t4)
#define GEN_ADAPTER_5(name, ret, t1, t2, t3, t4, t5)     GEN_ADAPTER_5_DEFINE(name, ret, t1, t2, t3, t4, t5)
#define GEN_ADAPTER_6(name, ret, t1, t2, t3, t4, t5, t6) GEN_ADAPTER_6_DEFINE(name, ret, t1, t2, t3, t4, t5, t6)
#else
#define GEN_ADAPTER_0(name, ret)                         GEN_ADAPTER_BLANK
#define GEN_ADAPTER_1(name, ret, t1)                     GEN_ADAPTER_BLANK
#define GEN_ADAPTER_2(name, ret, t1, t2)                 GEN_ADAPTER_BLANK
#define GEN_ADAPTER_3(name, ret, t1, t2, t3)             GEN_ADAPTER_BLANK
#define GEN_ADAPTER_4(name, ret, t1, t2, t3, t4)         GEN_ADAPTER_BLANK
#define GEN_ADAPTER_5(name, ret, t1, t2, t3, t4, t5)     GEN_ADAPTER_BLANK
#define GEN_ADAPTER_6(name, ret, t1, t2, t3, t4, t5, t6) GEN_ADAPTER_BLANK
#endif

#endif /* HELPER_ADAPTER_H */
