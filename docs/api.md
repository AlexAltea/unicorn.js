# API Documentation

Unicorn.js is a port of the [Unicorn](https://github.com/unicorn-engine/unicorn)
CPU emulator framework to JavaScript/WebAssembly. The core Unicorn library,
is compiled with [Emscripten](https://emscripten.org/), and a thin JavaScript
wrapper exposes a friendly API on top of it.

Everything documented here lives on the module object, conventionally named
`uc`; both the static functions/constants and the `Unicorn` engine class.

> **Coming from v1.x?** The API is largely the same, but two things changed:
> the module is now loaded **asynchronously** through the `MUnicorn()` factory
> (WebAssembly has to instantiate first), and all **64-bit values cross the
> JS-WASM boundary as `BigInt`** instead of `Number`. See
> [Loading the module](#loading-the-module) and
> [BigInt usage](#bigint-usage).

## Table of contents

- [Loading the module](#loading-the-module)
- [BigInt usage](#the-64-bit--bigint-convention)
- [Error handling](#error-handling)
- [Static functions](#static-functions)
- [The `Unicorn` engine](#the-unicorn-engine)
  - [Registers](#registers)
  - [Memory](#memory)
  - [Hooks](#hooks)
  - [Emulation](#emulation)
  - [Context (snapshots)](#context-snapshots)
  - [Queries](#queries)
  - [Lifecycle](#lifecycle)
- [Constants](#constants)
- [Credits](#credits)

## Loading the module

The build is an Emscripten module compiled with `MODULARIZE=1` and
`EXPORT_NAME='MUnicorn'`. `MUnicorn()` is a factory that returns a `Promise`
which resolves to the ready-to-use module object (here called `uc`) once the
WebAssembly has been instantiated.

**In the browser:**

```html
<script src="unicorn.js"></script>
<script>
  MUnicorn().then((uc) => {
      const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
      // ...
  });
</script>
```

**In Node.js:**

```javascript
const MUnicorn = require('@alexaltea/unicorn-js'); // or require('./dist/unicorn.js')

MUnicorn().then((uc) => {
    const e = new uc.Unicorn(uc.ARCH_X86, uc.MODE_64);
    // ...
});
```

**Requirements:** a JavaScript environment with
[WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) and
[BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
support (the WASM build relies on `WASM_BIGINT`).

### Available builds

The default `dist/unicorn.js` bundles every supported architecture and is
fairly large. Smaller per-architecture variants are published alongside it
and can be selected via the `require` or `import` subpath. e.g.:

```javascript
const MUnicorn = require('@alexaltea/unicorn-js');       // all architectures
const MUnicorn = require('@alexaltea/unicorn-js/x86');   // x86 only
```

Available subpaths: `arm`, `aarch64` (`arm64`), `m68k`, `mips`, `ppc`,
`riscv`, `s390x`, `sparc`, `tricore`, `x86`.

Each exposes the same _MUnicorn_ factory and API. Bundlers resolve the subpath
to a single file, so only the variant you select is bundled; over a CDN, reference the
file directly, e.g. `https://cdn.jsdelivr.net/npm/@alexaltea/unicorn-js/dist/unicorn_arm.js`.


## BigInt usage

Because JavaScript's `Number` cannot represent all 64-bit integers exactly,
Unicorn.js uses a simple rule at the JS-WASM boundary:

- **64-bit values are `BigInt`.** Everything narrower (8/16/32-bit integers,
  `float`, `double`) is a plain `Number`.

In practice:

| Where | Type |
|-------|------|
| Addresses / sizes passed **in** (`mem_map`, `mem_write`, `emu_start`, …) | `Number` or `BigInt` accepted (coerced internally) |
| `reg_read_i64` / `reg_write_i64` values | `BigInt` |
| `reg_read_i8/i16/i32`, `reg_*_float/double` values | `Number` |
| Guest address delivered to a `HOOK_CODE` / `HOOK_BLOCK` / memory hook | `BigInt` |
| `value` delivered to a memory hook | `BigInt` |
| `mem_regions()` `begin` / `end` | `BigInt` |

When in doubt, prefer `BigInt` literals (e.g. `0x1000n`) for addresses; the
wrapper accepts either form for inputs but always *returns* 64-bit results as
`BigInt`.

## Error handling

Every wrapped function checks Unicorn's return code. On any non-`ERR_OK`
result the method **throws** a descriptive string of the form:

```
Unicorn.js: Function uc_<name> failed with code <n>:
<human-readable message>
```

The trailing message is produced by [`strerror`](#strerrorcode). Wrap calls in
`try/catch` (or `.catch()` on the loader promise) to handle failures such as
unmapped-memory accesses or invalid instructions.

## Static functions

These live directly on the module object.

### version()
Returns the Unicorn core version packed into a single number, as
`(major << 24) | (minor << 16) | (patch << 8) | extra`. The discrete
`uc.VERSION_MAJOR` / `uc.VERSION_MINOR` / `uc.VERSION_PATCH` /
`uc.VERSION_EXTRA` constants are also available.

### arch_supported(arch)
Given an architecture constant (e.g. `uc.ARCH_X86`), returns a truthy value if
that architecture is compiled into this build, falsy otherwise.

### strerror(code)
Given an error code (a `uc.ERR_*` value, e.g. the result of
[`errno()`](#errno)), returns a human-readable description string.

## The `Unicorn` engine

```javascript
const e = new uc.Unicorn(arch, mode);
```

Creates and opens an emulator instance. `arch` is one of the
[`ARCH_*`](#architectures) constants and `mode` is a combination of the
[`MODE_*`](#modes) constants for that architecture. The constructor throws if
the engine cannot be opened. Always call [`close()`](#close) when done to free
native resources.

### Registers

#### reg_write(regid, bytes)
Writes the raw `bytes` (an array / typed array) into register `regid`. Use a
`<ARCH>_REG_*` [constant](#registers-1) for `regid`. For ordinary scalar
registers prefer the typed helpers below.

#### reg_read(regid, size)
Reads `size` raw bytes from register `regid` and returns them as a
`Uint8Array`. Useful for wide registers (e.g. vector/FP registers) that don't
fit a scalar helper.

#### Typed register helpers
Convenience wrappers around `reg_read` / `reg_write` that (de)serialize a
single scalar value of a known width:

```javascript
e.reg_write_i8(regid, value);     value = e.reg_read_i8(regid);
e.reg_write_i16(regid, value);    value = e.reg_read_i16(regid);
e.reg_write_i32(regid, value);    value = e.reg_read_i32(regid);
e.reg_write_i64(regid, value);    value = e.reg_read_i64(regid);   // value is a BigInt
e.reg_write_float(regid, value);  value = e.reg_read_float(regid);
e.reg_write_double(regid, value); value = e.reg_read_double(regid);
```

`*_i64` reads/writes use `BigInt`; all others use `Number` (see
[BigInt usage](#bigint-usage)).

```javascript
// x86-64 example
e.reg_write_i64(uc.X86_REG_RAX, 0x1122334455667788n);
const rax = e.reg_read_i64(uc.X86_REG_RAX);   // 0x1122334455667788n
```

### Memory

#### mem_map(address, size, perms)
Maps a region of `size` bytes at `address` with the given permissions
(`perms`, a combination of [`PROT_*`](#memory-protections)). `address` and
`size` must be page-aligned.

#### mem_protect(address, size, perms)
Changes the permissions of a previously mapped region to `perms`.

#### mem_unmap(address, size)
Unmaps the region of `size` bytes at `address`.

#### mem_write(address, bytes)
Writes `bytes` (an array / typed array of byte values) to guest memory starting
at `address`. The region must already be mapped.

#### mem_read(address, size)
Reads `size` bytes from guest memory at `address` and returns them as a
`Uint8Array`.

#### mem_regions()
Returns an array describing the currently mapped regions. Each entry is:

```javascript
{ begin: BigInt, end: BigInt, perms: Number /* PROT_* bitmask */ }
```

`begin` and `end` are inclusive guest addresses delivered as `BigInt`.

### Hooks

#### hook_add(type, callback, user_data, begin, end, extra)
Registers a callback and returns an opaque **hook object** (pass it to
[`hook_del`](#hook_delhook) to remove it).

- `type`:  one of the [`HOOK_*`](#hook-types) constants (event types may be
  OR'd together for memory hooks).
- `callback`:  the JavaScript function to invoke; its signature depends on
  `type` (see below).
- `user_data`:  an arbitrary value passed back to your callback as its last
  argument. Optional; defaults to `{}`.
- `begin`, `end`:  the inclusive guest-address range the hook applies to.
  Optional; if both are omitted the hook applies everywhere (`begin = 1`,
  `end = 0`, i.e. `begin > end`).
- `extra`:  only used by `HOOK_INSN`: the instruction id to match (e.g.
  `uc.X86_INS_SYSCALL`).

**Callback signatures** (the first argument is always the `Unicorn` instance
that owns the hook; 64-bit `address`/`value` arguments are `BigInt`):

| Hook type | Callback signature |
|-----------|--------------------|
| `HOOK_CODE`, `HOOK_BLOCK` | `(uc, address, size, user_data)` |
| `HOOK_INTR` | `(uc, intno, user_data)` |
| `HOOK_INSN` | `(uc, user_data)` |
| `HOOK_MEM_READ` / `WRITE` / `FETCH` / `READ_AFTER` | `(uc, type, address, size, value, user_data)` |
| `HOOK_MEM_*_UNMAPPED` / `HOOK_MEM_*_PROT` (events) | `(uc, type, address, size, value, user_data)` → return `true` to retry the access, `false` to stop |

For memory hooks, `type` is one of the [`MEM_*`](#memory-event-types)
constants.

```javascript
const hook = e.hook_add(uc.HOOK_CODE, (uc, addr, size, data) => {
    console.log('exec', addr.toString(16), 'len', size);
}, {}, ADDRESS, ADDRESS + CODE.length);
```

#### hook_del(hook)
Removes a hook previously returned by [`hook_add`](#hook_addtype-callback-user_data-begin-end-extra)
and frees its underlying function pointer.

### Emulation

#### emu_start(begin, until, timeout, count)
Starts emulation at address `begin` and runs until address `until` is reached.

- `timeout`:  maximum run time in **microseconds** (`0` = no limit). The
  `uc.SECOND_SCALE` (1 s = 1,000,000) and `uc.MILISECOND_SCALE` constants help
  build this value.
- `count`:  maximum number of instructions to execute (`0` = no limit).

Throws if emulation stops on an error (e.g. an invalid instruction or an
unmapped access not handled by a hook).

#### emu_stop()
Stops emulation. Typically called from inside a hook callback to halt the run.

### Context (snapshots)

These let you snapshot and restore the full CPU register state, e.g. to
implement save/restore or speculative execution.

#### context_alloc()
Allocates a context object sized for this engine and returns an opaque handle.
Free it with [`context_free`](#context_freecontext) when no longer needed.

#### context_save(context)
Saves the engine's current CPU state into `context`.

#### context_restore(context)
Restores the engine's CPU state from a previously saved `context`.

#### context_free(context)
Frees a context handle returned by
[`context_alloc`](#context_alloc).

```javascript
const ctx = e.context_alloc();
e.context_save(ctx);                       // snapshot
e.reg_write_i64(uc.X86_REG_RAX, 0x2222n);  // mutate
e.context_restore(ctx);                    // roll back
e.context_free(ctx);
```

### Queries

#### query_type(query, result_type) and helpers
Queries an engine property. `query` is one of the [`QUERY_*`](#query-types)
constants; `result_type` is an Emscripten value type (`'i8'`, `'i16'`,
`'i32'`, `'i64'`, `'float'`, `'double'`). Convenience helpers fix the result
type:

```javascript
e.query_i8(query);   e.query_i16(query);   e.query_i32(query);
e.query_i64(query);  e.query_float(query); e.query_double(query);
```

`query_i64` returns a `BigInt`; the others return a `Number`.

```javascript
const pageSize = e.query_i32(uc.QUERY_PAGE_SIZE);
```

### Lifecycle

#### errno()
Returns the [`ERR_*`](#error-codes) code of the most recent error on this
engine (without throwing). Pass it to [`strerror`](#strerrorcode) for a
message.

#### close()
Closes the engine and frees all native resources associated with it. After
`close()` the instance must not be used again.

## Constants

All constants are merged onto the module object. The engine-level enums
(architectures, modes, permissions, errors, hook/memory/query types) are
defined in `src/unicorn-wrapper.js`; the per-architecture register and
instruction constants are **auto-generated** from Unicorn's C headers into
`src/constants_<arch>.js` at build time. Constant names are the upstream
`UC_*` macros with the `UC_` prefix removed (e.g. `UC_X86_REG_RAX` →
`uc.X86_REG_RAX`).

### Architectures
`ARCH_ARM`, `ARCH_ARM64`, `ARCH_MIPS`, `ARCH_X86`, `ARCH_PPC`, `ARCH_SPARC`,
`ARCH_M68K`, `ARCH_RISCV`, `ARCH_S390X`, `ARCH_TRICORE`.

> ARM64, PPC, RISC-V, s390x and TriCore are new in the v2 (Unicorn 2.1.4) port.

### Modes
Endianness: `MODE_LITTLE_ENDIAN`, `MODE_BIG_ENDIAN`. Common per-architecture
modes include `MODE_ARM`, `MODE_THUMB`, `MODE_16`, `MODE_32`, `MODE_64`,
`MODE_MIPS32`, `MODE_MIPS64`, `MODE_PPC32`, `MODE_PPC64`, `MODE_SPARC32`,
`MODE_SPARC64`, `MODE_RISCV32`, `MODE_RISCV64`, and more. Combine an
architecture mode with an endianness as required, e.g.
`uc.MODE_PPC32 | uc.MODE_BIG_ENDIAN`.

### Memory protections
`PROT_NONE`, `PROT_READ`, `PROT_WRITE`, `PROT_EXEC`, `PROT_ALL`. Combine with
bitwise OR; `PROT_ALL` is read+write+exec.

### Error codes
`ERR_OK`, `ERR_NOMEM`, `ERR_ARCH`, `ERR_HANDLE`, `ERR_MODE`, `ERR_VERSION`,
`ERR_READ_UNMAPPED`, `ERR_WRITE_UNMAPPED`, `ERR_FETCH_UNMAPPED`, `ERR_HOOK`,
`ERR_INSN_INVALID`, `ERR_MAP`, `ERR_WRITE_PROT`, `ERR_READ_PROT`,
`ERR_FETCH_PROT`, `ERR_ARG`, `ERR_READ_UNALIGNED`, `ERR_WRITE_UNALIGNED`,
`ERR_FETCH_UNALIGNED`, `ERR_HOOK_EXIST`, `ERR_RESOURCE`, `ERR_EXCEPTION`,
`ERR_OVERFLOW`.

### Hook types
`HOOK_INTR`, `HOOK_INSN`, `HOOK_CODE`, `HOOK_BLOCK`,
`HOOK_MEM_READ_UNMAPPED`, `HOOK_MEM_WRITE_UNMAPPED`, `HOOK_MEM_FETCH_UNMAPPED`,
`HOOK_MEM_READ_PROT`, `HOOK_MEM_WRITE_PROT`, `HOOK_MEM_FETCH_PROT`,
`HOOK_MEM_READ`, `HOOK_MEM_WRITE`, `HOOK_MEM_FETCH`, `HOOK_MEM_READ_AFTER`,
`HOOK_INSN_INVALID`, `HOOK_EDGE_GENERATED`, `HOOK_TCG_OPCODE`, `HOOK_TLB_FILL`.

Convenience combinations: `HOOK_MEM_UNMAPPED`, `HOOK_MEM_PROT`,
`HOOK_MEM_READ_INVALID`, `HOOK_MEM_WRITE_INVALID`, `HOOK_MEM_FETCH_INVALID`,
`HOOK_MEM_INVALID`, `HOOK_MEM_VALID`.

### Memory event types
Passed as the `type` argument to memory-hook callbacks: `MEM_READ`,
`MEM_WRITE`, `MEM_FETCH`, `MEM_READ_UNMAPPED`, `MEM_WRITE_UNMAPPED`,
`MEM_FETCH_UNMAPPED`, `MEM_WRITE_PROT`, `MEM_READ_PROT`, `MEM_FETCH_PROT`,
`MEM_READ_AFTER`.

### Query types
`QUERY_MODE`, `QUERY_PAGE_SIZE`, `QUERY_ARCH`, `QUERY_TIMEOUT`.

### Version
`VERSION_MAJOR`, `VERSION_MINOR`, `VERSION_PATCH`, `VERSION_EXTRA` (and the
`API_MAJOR` / `API_MINOR` / `API_PATCH` / `API_EXTRA` aliases), plus the time
scales `SECOND_SCALE` and `MILISECOND_SCALE`.

### Registers
Reference registers by the constant for their architecture, formatted as
`<ARCH>_REG_<name>`:

| Architecture | Prefix |
|--------------|--------|
| ARM64 | `ARM64_REG_*` |
| ARM | `ARM_REG_*` |
| M68K | `M68K_REG_*` |
| MIPS | `MIPS_REG_*` |
| PPC | `PPC_REG_*` |
| RISC-V | `RISCV_REG_*` |
| s390x | `S390X_REG_*` |
| SPARC | `SPARC_REG_*` |
| TriCore | `TRICORE_REG_*` |
| X86 | `X86_REG_*` |

See each architecture's own documentation for the meaning of its registers.

### Instructions
Used with `HOOK_INSN` (the `extra` argument of
[`hook_add`](#hook_addtype-callback-user_data-begin-end-extra)). Two
architectures expose instruction constants:

- **X86**:  `X86_INS_*` (e.g. `X86_INS_SYSCALL`, `X86_INS_IN`, `X86_INS_OUT`,
  `X86_INS_CPUID`).
- **ARM64**:  `ARM64_INS_*` (e.g. `ARM64_INS_MRS`, `ARM64_INS_MSR`,
  `ARM64_INS_SYS`).

## Credits

Developers of Unicorn: Nguyen Anh Quynh, Dang Hoang Vu, Ziqiao Kong, and contributors

Developers of Unicorn.js: Alexandro Sanchez Bach and contributors

Contributors to the documentation: @supremestdoggo, Alexandro Sanchez Bach

