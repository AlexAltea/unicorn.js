# API Documentation
Unicorn.js is a port of the Unicorn CPU emulator to Javascript. It uses Emscripten to compile the core Unicorn library, with a JS wrapper as well. Please note that everything here is within the `uc` object.

## Functions
### version()
Returns the Unicorn version number.
### arch_supported(arch)
Given the name of a processor architecture, return a boolean value representing if that architecture is supported.
### strerr(code)
Given an error code, return the code in a human-readable format.
## Unicorn(arch, mode)
An emulator object. `arch` is the name of the architecture the emulator will emulate, and `mode` is the mode it will be in.
### Methods
#### reg_write(regid, bytes)
Writes the inputted bytes to the inputted register (which is represented by `regid`). Please note that you should use one of the constants for `regid`, as otherwise you would need to dig through [unicorn-constants.js](https://github.com/AlexAltea/unicorn.js/blob/master/src/unicorn-constants.js) (or the Constants section of this documentation, when that's finally written).
#### reg_read(regid, size)
TODO
#### mem_write(address, bytes)
Write the inputted bytes (`bytes`) to the inputted memory address (`address`).
#### mem_read(address, size)
TODO
#### mem_map(address, size, perms)
TODO
#### mem_protect(address, size, perms)
TODO
#### mem_regions()
TODO
#### mem_unmap(address, size)
TODO
#### hook_add(type, user_callback, user_data, begin, end, extra)
Creates a hook object. (TODO: Add more detail)
#### hook_del(hook)
Removes the inputted hook object (`hook`) from the Unicorn object.
#### emu_start(begin, until, timeout, count)
Start the emulator, running the code in memory from the starting address (`begin`) to the final address (`until`). (TODO: Explain what `timeout` and `count` do)
#### emu_stop(begin, until, timeout, count)
TODO (Also, the code for this function doesn't use any of these arguments, so they seem to be unessecary)
#### context_alloc()
TODO
#### context_free()
TODO
#### context_save()
TODO
#### context_restore()
TODO
#### errno()
TODO
#### close()
TODO
## Constants
### Registers
You should use these when referencing registers. Under the hood, they all reference numbers that actually get passed to the Unicorn engine. See each architecture's respective documentation for more information on their registers.
#### ARM64
Formatted as `ARM64_REG_[register name]`.
#### ARM
Formatted as `ARM_REG_[register name]`.
#### M68K
Formatted as `M68K_REG_[register name]`.
#### MIPS
Formatted as `MIPS_REG_[register name]`.
#### SPARC
Formatted as `SPARC_REG_[register name]`.
#### X86
Formatted as `X86_REG_[register name]`.
### X86 Insturctions
You should use these when referencing X86 instructions (should you ever do so rather than using Capstone.js or Keystone.js). Under the hood, they all reference numbers that actually get passed to the Unicorn engine. Formatted as `X86_INS_[instruction name]`. See the X86 documentation for more information on its instructions.
### Unicorn Constants
TODO

## Credits
Developers of Unicorn: Nguyen Anh Quynh, Dang Hoang Vu, Ziqiao Kong, and contributors  
Developers of Unicorn.js: Alexandro Sanchez Bach and contributors  
Contributors to the documentation: supremestdoggo (wrote most of it), Alexandro Sanchez Bach (revised before merging)
