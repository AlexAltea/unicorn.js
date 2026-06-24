Unicorn.js
==========

Port of the [Unicorn](https://github.com/unicorn-engine/unicorn) CPU emulator framework for JavaScript/WASM. Powered by [Emscripten](https://github.com/emscripten-core/emscripten).

**Requirements:** JavaScript environment with [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) and [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) support.

**Notes:** _Unicorn_ is a lightweight multi-architecture CPU emulator framework originally developed by Nguyen Anh Quynh, Dang Hoang Vu et al. and released under GPLv2 license. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT` and `COPYING` inside the *unicorn* submodule of this repository.

## Installation

To use Unicorn.js in your web application, download and include it with:

```html
<script src="unicorn.js"></script>
```

or install it with the NPM command:

```bash
npm install @alexaltea/unicorn-js
```

### Lightweight single-architecture variants

The default build supports all architectures. If you only need one, smaller per-architecture variants are published alongside it and can be selected via the `require` or `import` subpath:

```javascript
const MUnicorn = require('@alexaltea/unicorn-js');      // all architectures
const MUnicorn = require('@alexaltea/unicorn-js/x86');  // x86 only
```

Available variants: `arm`, `aarch64`, `m68k`, `mips`, `ppc`, `riscv`, `s390x`, `sparc`, `tricore`, `x86`.

You can also include these variants directly via CDNs, e.g. \
`https://cdn.jsdelivr.net/npm/@alexaltea/unicorn-js/dist/unicorn_x86.js`

## Usage

```javascript
var addr = 0x10000;
var code = [
  0x37, 0x00, 0xA0, 0xE3,  // mov r0, #0x37
  0x03, 0x10, 0x42, 0xE0,  // sub r1, r2, r3
];

MUnicorn().then((uc) => {
    // Initialize engine
    var e = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_ARM);

    // Write registers and memory
    e.reg_write_i32(uc.ARM_REG_R2, 0x456);
    e.reg_write_i32(uc.ARM_REG_R3, 0x123);
    e.mem_map(addr, 4*1024, uc.PROT_ALL);
    e.mem_write(addr, code);

    // Start emulator
    var begin = addr;
    var until = addr + code.length;
    e.emu_start(begin, until, 0, 0);

    // Read registers
    var r0 = e.reg_read_i32(uc.ARM_REG_R0);  // 0x37
    var r1 = e.reg_read_i32(uc.ARM_REG_R1);  // 0x333

    e.close();
});
```

## Building

To build the Unicorn.js library:

1. Clone this repository including its submodules:
    ```bash
    git clone --recursive https://github.com/AlexAltea/unicorn.js
    ```

2. Install the latest [Python 3.x](https://www.python.org/downloads/), [CMake](http://www.cmake.org/download/) and the [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html). Follow the corresponding instructions and make sure all environment variables are configured correctly.

3. Run the build script:
    ```bash
    python3 build.py
    ```

Build artifacts will be saved to [`dist`](./dist/).

> [!TIP]
> Pass architecture names to produce a smaller, single-architecture bundle (e.g. `python3 build.py x86`), or `python3 build.py --release` to build every variant.
