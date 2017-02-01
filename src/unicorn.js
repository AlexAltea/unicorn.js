/**
 * (c) 2016-2017 Unicorn.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

// Emscripten demodularize
var MUnicorn = new MUnicorn();

// Extend Unicorn.js namespace with per-architecture members
 Object.prototype.extend = function(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            this[i] = obj[i];
        }
    }
};

var uc = {
    // Return codes
    ERR_OK:                 0,  // No error: everything was fine
    ERR_NOMEM:              1,  // Out-Of-Memory error: uc_open(), uc_emulate()
    ERR_ARCH:               2,  // Unsupported architecture: uc_open()
    ERR_HANDLE:             3,  // Invalid handle
    ERR_MODE:               4,  // Invalid/unsupported mode: uc_open()
    ERR_VERSION:            5,  // Unsupported version (bindings)
    ERR_READ_UNMAPPED:      6,  // Quit emulation due to READ on unmapped memory: uc_emu_start()
    ERR_WRITE_UNMAPPED:     7,  // Quit emulation due to WRITE on unmapped memory: uc_emu_start()
    ERR_FETCH_UNMAPPED:     8,  // Quit emulation due to FETCH on unmapped memory: uc_emu_start()
    ERR_HOOK:               9,  // Invalid hook type: uc_hook_add()
    ERR_INSN_INVALID:      10,  // Quit emulation due to invalid instruction: uc_emu_start()
    ERR_MAP:               11,  // Invalid memory mapping: uc_mem_map()
    ERR_WRITE_PROT:        12,  // Quit emulation due to UC_MEM_WRITE_PROT violation: uc_emu_start()
    ERR_READ_PROT:         13,  // Quit emulation due to UC_MEM_READ_PROT violation: uc_emu_start()
    ERR_FETCH_PROT:        14,  // Quit emulation due to UC_MEM_FETCH_PROT violation: uc_emu_start()
    ERR_ARG:               15,  // Inavalid argument provided to uc_xxx function (See specific function API)
    ERR_READ_UNALIGNED:    16,  // Unaligned read
    ERR_WRITE_UNALIGNED:   17,  // Unaligned write
    ERR_FETCH_UNALIGNED:   18,  // Unaligned fetch
    ERR_HOOK_EXIST:        19,  // hook for this event already existed
    ERR_RESOURCE:          20,  // Insufficient resource: uc_emu_start()
    ERR_EXCEPTION:         21,  // Unhandled CPU exception

    // Architectures
    ARCH_ARM:               1,  // ARM architecture (including Thumb, Thumb-2)
    ARCH_ARM64:             2,  // ARM-64, also called AArch64
    ARCH_MIPS:              3,  // Mips architecture
    ARCH_X86:               4,  // X86 architecture (including x86 & x86-64)
    ARCH_PPC:               5,  // PowerPC architecture (currently unsupported)
    ARCH_SPARC:             6,  // Sparc architecture
    ARCH_M68K:              7,  // M68K architecture

    // Modes
    MODE_LITTLE_ENDIAN:     0,  // Little-Endian mode (default mode)
    MODE_BIG_ENDIAN:  1 << 30,  // Big-Endian mode
    MODE_ARM:               0,  // ARM/ARM64: ARM mode
    MODE_THUMB:       1 <<  4,  // ARM/ARM64: THUMB mode (including Thumb-2)
    MODE_MCLASS:      1 <<  5,  // ARM/ARM64: ARM's Cortex-M series (currently unsupported)
    MODE_V8:          1 <<  6,  // ARM/ARM64: ARMv8 A32 encodings for ARM (currently unsupported)
    MODE_MICRO:       1 <<  4,  // MIPS: MicroMips mode (currently unsupported)
    MODE_MIPS3:       1 <<  5,  // MIPS: Mips III ISA (currently unsupported)
    MODE_MIPS32R6:    1 <<  6,  // MIPS: Mips32r6 ISA (currently unsupported)
    MODE_MIPS32:      1 <<  2,  // MIPS: Mips32 ISA
    MODE_MIPS64:      1 <<  3,  // MIPS: Mips64 ISA
    MODE_16:          1 <<  1,  // X86: 16-bit mode
    MODE_32:          1 <<  2,  // X86: 32-bit mode
    MODE_64:          1 <<  3,  // X86: 64-bit mode
    MODE_PPC32:       1 <<  2,  // PPC: 32-bit mode (currently unsupported)
    MODE_PPC64:       1 <<  3,  // PPC: 64-bit mode (currently unsupported)
    MODE_QPX:         1 <<  4,  // PPC: Quad Processing eXtensions mode (currently unsupported)
    MODE_SPARC32:     1 <<  2,  // SPARC: 32-bit mode
    MODE_SPARC64:     1 <<  3,  // SPARC: 64-bit mode
    MODE_V9:          1 <<  4,  // SPARC: SparcV9 mode (currently unsupported)

    // Memory
    MEM_READ:              16,  // Memory is read from
    MEM_WRITE:             17,  // Memory is written to
    MEM_FETCH:             18,  // Memory is fetched
    MEM_READ_UNMAPPED:     19,  // Unmapped memory is read from
    MEM_WRITE_UNMAPPED:    20,  // Unmapped memory is written to
    MEM_FETCH_UNMAPPED:    21,  // Unmapped memory is fetched
    MEM_WRITE_PROT:        22,  // Write to write protected, but mapped, memory
    MEM_READ_PROT:         23,  // Read from read protected, but mapped, memory
    MEM_FETCH_PROT:        24,  // Fetch from non-executable, but mapped, memory
    MEM_READ_AFTER:        25,  // Memory is read from (successful access)

    // Protections
    PROT_NONE:              0,
    PROT_READ:              1,  // Read
    PROT_WRITE:             2,  // Write
    PROT_EXEC:              4,  // Execute
    PROT_ALL:               7,  // Read | Write | Execute

    // Hooks
    HOOK_INTR:                1 <<  0,  // Hook all interrupt/syscall events
    HOOK_INSN:                1 <<  1,  // Hook a particular instruction
    HOOK_CODE:                1 <<  2,  // Hook a range of code
    HOOK_BLOCK:               1 <<  3,  // Hook basic blocks
    HOOK_MEM_READ_UNMAPPED:   1 <<  4,  // Hook for memory read on unmapped memory
    HOOK_MEM_WRITE_UNMAPPED:  1 <<  5,  // Hook for invalid memory write events
    HOOK_MEM_FETCH_UNMAPPED:  1 <<  6,  // Hook for invalid memory fetch for execution events
    HOOK_MEM_READ_PROT:       1 <<  7,  // Hook for memory read on read-protected memory
    HOOK_MEM_WRITE_PROT:      1 <<  8,  // Hook for memory write on write-protected memory
    HOOK_MEM_FETCH_PROT:      1 <<  9,  // Hook for memory fetch on non-executable memory
    HOOK_MEM_READ:            1 << 10,  // Hook memory read events.
    HOOK_MEM_WRITE:           1 << 11,  // Hook memory write events.
    HOOK_MEM_FETCH:           1 << 12,  // Hook memory fetch for execution events
    HOOK_MEM_READ_AFTER:      1 << 13,  // Hook memory read events, but only successful access.

    // Hooks (shorthands)
    // Hook type for all events of unmapped memory access
    // > HOOK_MEM_READ_UNMAPPED | HOOK_MEM_WRITE_UNMAPPED | HOOK_MEM_FETCH_UNMAPPED
    HOOK_MEM_UNMAPPED: (1 << 4) | (1 << 5) | (1 << 6),
    // Hook type for all events of illegal protected memory access
    // > HOOK_MEM_READ_PROT | HOOK_MEM_WRITE_PROT | HOOK_MEM_FETCH_PROT
    HOOK_MEM_PROT: (1 << 7) | (1 << 8) | (1 << 9),
    // Hook type for all events of illegal read memory access
    // > HOOK_MEM_READ_PROT | HOOK_MEM_READ_UNMAPPED
    HOOK_MEM_READ_INVALID: (1 << 4) | (1 << 7),
    // Hook type for all events of illegal write memory access
    // > HOOK_MEM_WRITE_PROT | HOOK_MEM_WRITE_UNMAPPED
    HOOK_MEM_WRITE_INVALID: (1 << 5) | (1 << 8),
    // Hook type for all events of illegal fetch memory access
    // > HOOK_MEM_FETCH_PROT | HOOK_MEM_FETCH_UNMAPPED
    HOOK_MEM_FETCH_INVALID: (1 << 6) | (1 << 9),
    // Hook type for all events of illegal memory access
    // > HOOK_MEM_UNMAPPED | HOOK_MEM_PROT
    HOOK_MEM_INVALID: (1 << 4) | (1 << 5) | (1 << 6) | (1 << 7) | (1 << 8) | (1 << 9),
    // Hook type for all events of valid memory access
    // > HOOK_MEM_READ | HOOK_MEM_WRITE | HOOK_MEM_FETCH
    HOOK_MEM_VALID: (1 << 10) | (1 << 11) | (1 << 12),

    // Static
    version: function() {
        major_ptr = MUnicorn._malloc(4);
        minor_ptr = MUnicorn._malloc(4);
        var ret = MUnicorn.ccall('uc_version', 'number',
            ['pointer', 'pointer'], [major_ptr, minor_ptr]);
        major = MUnicorn.getValue(major_ptr, 'i32');
        minor = MUnicorn.getValue(minor_ptr, 'i32');
        MUnicorn._free(major_ptr);
        MUnicorn._free(minor_ptr);
        return ret;
    },

    arch_supported: function(arch) {
        var ret = MUnicorn.ccall('uc_arch_supported', 'number', ['number'], [arch]);
        return ret;
    },

    strerror: function(code) {
        var ret = MUnicorn.ccall('uc_strerror', 'string', ['number'], [code]);
        return ret;
    },

    /**
     * Unicorn object
     */
    Unicorn: function (arch, mode) {
        this.arch = arch;
        this.mode = mode;
        this.handle_ptr = MUnicorn._malloc(4);

        // Methods
        this.reg_write = function (regid, value) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, this.handle_ptr]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_reg_write failed with code %d.', ret);
            }
        }

        this.reg_read = function (regid) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, this.handle_ptr]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_reg_read failed with code %d.', ret);
            }
        }

        this.mem_write = function (address, bytes) {
            // Allocate bytes buffer and copy data
            var buffer_len = bytes.length;
            var buffer_ptr = MUnicorn._malloc(buffer_len);
            MUnicorn.writeArrayToMemory(bytes, buffer_ptr);

            // Write to memory
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_write', 'number',
                ['pointer', 'number', 'number', 'pointer', 'number'],
                [handle, address, 0, buffer_ptr, buffer_len]
            );
            // Free memory and handle return code
            MUnicorn._free(buffer_ptr);
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_mem_write failed with code %d.', ret);
            }
        }

        this.mem_read = function (address, size) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_read', 'number',
                ['pointer', 'number', 'number', 'pointer', 'number'],
                [handle, address, 0, bytes, size]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_mem_read failed with code %d.', ret);
            }
        }

        this.mem_map = function (address, size, perms) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_map', 'number',
                ['pointer', 'number', 'number', 'number', 'number'],
                [handle, address, 0, size, perms]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_mem_map failed with code %d.', ret);
            }
        }

        this.mem_unmap = function (address, size) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_map', 'number',
                ['pointer', 'number', 'number', 'number'],
                [handle, address, 0, size]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_mem_map failed with code %d.', ret);
            }
        }

        this.emu_start = function (begin, until, timeout, count) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_emu_start', 'number',
                ['pointer', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
                [handle, begin, 0, until, 0, timeout, 0, count]
            );
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_emu_start failed with code %d.', ret);
            }
        }

        this.emu_stop = function (begin, until, timeout, count) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_emu_stop', 'number', ['number'], [handle]);
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_emu_stop failed with code %d.', ret);
            }
        }

        this.errno = function() {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_errno', 'number', ['pointer'], [handle]);
            return ret;
        }

        this.close = function() {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_close', 'number', ['pointer'], [handle]);
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_close failed with code %d.', ret);
            }
        }

        // Helpers
        this.reg_write_int = function (regid, value) {
            // Allocate space for the output value
            var value_ptr = MUnicorn._malloc(4);
            MUnicorn.setValue(value_ptr, value, 'i32');

            // Register read
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Free memory and handle return code
            MUnicorn._free(value_ptr);
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_reg_write failed with code %d.', ret);
            }
        }

        this.reg_read_int = function (regid) {
            // Allocate space for the output value
            var value_ptr = MUnicorn._malloc(4);
            MUnicorn.setValue(value_ptr, 0, 'i32');

            // Register read
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Get register value, free memory and handle return code
            var value = MUnicorn.getValue(value_ptr, 'i32');
            MUnicorn._free(value_ptr);
            if (ret != uc.ERR_OK) {
                console.error('Unicorn.js: Function uc_reg_read failed with code %d.', ret);
            }
            return value;
        }


        // Constructor
        var ret = MUnicorn.ccall('uc_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );

        if (ret != uc.ERR_OK) {
            MUnicorn.setValue(this.handle_ptr, 0, '*');
            console.error('Unicorn.js: Function uc_open failed with code %d.', ret);
        }
    }
};
