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
TODO
#### emu_stop(begin, until, timeout, count)
TODO
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
### Helpers
TODO (Also, I'm not entirely sure that these should be documented, seeing as they're helpers meant to be used internally)
## Constants
TODO