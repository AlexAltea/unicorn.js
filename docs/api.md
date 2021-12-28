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
TODO
## Constants
TODO
