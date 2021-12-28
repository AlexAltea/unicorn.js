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
#### reg_write()
TODO
#### reg_read()
TODO
#### mem_write()
TODO
#### mem_read()
TODO
#### mem_map()
TODO
#### mem_protect()
TODO
#### mem_regions()
TODO
#### mem_unmap()
TODO
#### hook_add()
TODO
#### hook_del()
TODO
#### emu_start()
TODO
#### emu_stop()
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
TODO (Also, I'm not entirely sure that these should be documented, seeing as they're helpers only meant to be used internally)
## Constants
TODO
