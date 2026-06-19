# Tests

Node-based smoke/regression tests for the WASM build. They `require()` the
built module (`dist/unicorn.js`) and run small pieces of guest code, asserting
both correct results and the JS↔WASM integer convention (64-bit values as
`BigInt`, everything narrower as `Number`).

## Running

```sh
npm run build      # produces dist/unicorn.js + dist/unicorn.wasm
npm test           # runs all tests against ./dist/unicorn.js
```

Run one test, or point at a specific build:

```sh
node tests/test_helpers.js
node tests/main.js dist/unicorn-x86.js
```

Each test exits `0` on PASS and non-zero on FAIL; `main.js` aggregates them and
sets its exit code accordingly.

## What each test covers

| Test | Exercises | Regression it guards |
|------|-----------|----------------------|
| `test_arch_arm.js` | ARM, 32-bit register path (`Number`), `UC_HOOK_CODE` | The `glib_compat.c` function-pointer patch — ARM `uc_open` sorts the cpreg list via `g_list_sort`; without the patch that indirect comparator call traps under WASM. |
| `test_arch_x86.js` | x86-64, 64-bit registers as `BigInt`, 64-bit hook address | The BigInt-for-64-bit FFI convention and `WASM_BIGINT` hook trampolines. |
| `test_arch_riscv.js` | RISC-V (riscv64), 32-bit register path (`Number`) | That the RISC-V target (added in the 2.1.4 port) is compiled in and its TCI translate/helper/adapter path works. |
| `test_arch_ppc.js` | PPC (32-bit, big-endian), 32-bit register path (`Number`) | That the PPC target (added in the 2.1.4 port) is compiled in and its TCI translate/helper/adapter path works. |
| `test_arch_s390x.js` | s390x (big-endian), 64-bit register path (`BigInt`) | That the s390x target (added in the 2.1.4 port) is compiled in and its TCI translate/helper/adapter path works. |
| `test_arch_tricore.js` | TriCore (little-endian), 32-bit register path (`Number`) | That the TriCore target (added in the 2.1.4 port) is compiled in and its TCI translate/helper/adapter path works (incl. its >4K page size). |
| `test_hooks.js` | `UC_HOOK_INSN` for `syscall` | The variadic `uc_hook_add` path — `src/unicorn-wrapper.js` hand-builds the wasm32 `va_list` buffer that carries the instruction id. |
| `test_helpers.js` | x86-64 `div` (`helper_divq_EAX` / `helper_divl_EAX`) | The QEMU adapter-helper machinery (+ coupled `tcg/tcg.c` 64-bit-arg patch). TCI dispatches every helper through one fixed signature; without the adapters this `call_indirect` traps with `null function or function signature mismatch`. |

The two "function pointer" patches above (`glib`, adapters) and the variadic
`uc_hook_add` handling are WASM `call_indirect` requirements, not asm.js-era
leftovers — these tests are what catch a regression if any of them is removed.
