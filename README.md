Unicorn.js
==========
[![Last Release](https://img.shields.io/badge/version-0.9-brightgreen.svg?style=flat)](https://github.com/AlexAltea/unicorn.js/releases)

Port of the [Unicorn](https://github.com/unicorn-engine/unicorn) CPU emulator framework for JavaScript. Powered by [Emscripten](https://github.com/kripken/emscripten).

**Notes:** _Unicorn_ is a lightweight multi-architecture CPU emulator framework originally developed by Nguyen Anh Quynh, Dang Hoang Vu et al. and released under GPLv2 license. More information about contributors and license terms can be found in the files `AUTHORS.TXT`, `CREDITS.TXT` and `COPYING` inside the *unicorn* submodule of this repository.

## Installation
To add Unicorn.js to your web application, include it with:
```html
<script src="unicorn.min.js"></script>
```
or install it with the Bower command:
```bash
bower install unicornjs
```

## Usage                                                      
```javascript
var addr = 0x10000;
var code = [
  0x37, 0x00, 0xA0, 0xE3,  // mov r0, #0x37
  0x03, 0x10, 0x42, 0xE0,  // sub r1, r2, r3
];

// Initialize engine
var e = new uc.Unicorn(uc.ARCH_ARM, uc.MODE_ARM);

// Write registers and memory
e.reg_write_i32(uc.ARM_REG_R2, 0x456);
e.reg_write_i32(uc.ARM_REG_R3, 0x123);
e.mem_map(addr, 4*1024, uc.PROT_ALL);
e.mem_write(addr, code)

// Start emulator
var begin = addr;
var until = addr + code.length;
e.emu_start(begin, until, 0, 0);

// Read registers
var r0 = e.reg_read_i32(uc.ARM_REG_R0);  // 0x37
var r1 = e.reg_read_i32(uc.ARM_REG_R1);  // 0x333
```

## Building
To build the Unicorn.js library, clone the *master* branch of this repository on a Linux machine, and do the following:

1. Initialize the original Unicorn submodule: `git submodule update --init`.

2. Install the latest [Python 2.x (64-bit)](https://www.python.org/downloads/) and the [Emscripten SDK](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Follow the respective instructions and make sure all environment variables are configured correctly.

3. Install the development dependencies with: `npm install`.

4. Finally, build the source with: `grunt build`.
