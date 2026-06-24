/**
 * (c) 2016-2026 Unicorn.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

Object.assign(Module, {
    // uc_arch
    ARCH_ARM: 1,
    ARCH_ARM64: 2,
    ARCH_MIPS: 3,
    ARCH_X86: 4,
    ARCH_PPC: 5,
    ARCH_SPARC: 6,
    ARCH_M68K: 7,
    ARCH_RISCV: 8,
    ARCH_S390X: 9,
    ARCH_TRICORE: 10,
    ARCH_MAX: 11,

    // uc_mode
    MODE_LITTLE_ENDIAN: 0,
    MODE_BIG_ENDIAN: 1 << 30,
    MODE_ARM: 0,
    MODE_THUMB: 1 << 4,
    MODE_MCLASS: 1 << 5,
    MODE_V8: 1 << 6,
    MODE_ARM926: 1 << 7,
    MODE_ARM946: 1 << 8,
    MODE_ARM1176: 1 << 9,
    MODE_ARMBE8: 1 << 10,
    MODE_MICRO: 1 << 4,
    MODE_MIPS3: 1 << 5,
    MODE_MIPS32R6: 1 << 6,
    MODE_MIPS32: 1 << 2,
    MODE_MIPS64: 1 << 3,
    MODE_16: 1 << 1,
    MODE_32: 1 << 2,
    MODE_64: 1 << 3,
    MODE_PPC32: 1 << 2,
    MODE_PPC64: 1 << 3,
    MODE_QPX: 1 << 4,
    MODE_SPARC32: 1 << 2,
    MODE_SPARC64: 1 << 3,
    MODE_V9: 1 << 4,
    MODE_RISCV32: 1 << 2,
    MODE_RISCV64: 1 << 3,

    // uc_err
    ERR_OK: 0,
    ERR_NOMEM: 1,
    ERR_ARCH: 2,
    ERR_HANDLE: 3,
    ERR_MODE: 4,
    ERR_VERSION: 5,
    ERR_READ_UNMAPPED: 6,
    ERR_WRITE_UNMAPPED: 7,
    ERR_FETCH_UNMAPPED: 8,
    ERR_HOOK: 9,
    ERR_INSN_INVALID: 10,
    ERR_MAP: 11,
    ERR_WRITE_PROT: 12,
    ERR_READ_PROT: 13,
    ERR_FETCH_PROT: 14,
    ERR_ARG: 15,
    ERR_READ_UNALIGNED: 16,
    ERR_WRITE_UNALIGNED: 17,
    ERR_FETCH_UNALIGNED: 18,
    ERR_HOOK_EXIST: 19,
    ERR_RESOURCE: 20,
    ERR_EXCEPTION: 21,
    ERR_OVERFLOW: 22,

    // uc_mem_type
    MEM_READ: 16,
    MEM_WRITE: 17,
    MEM_FETCH: 18,
    MEM_READ_UNMAPPED: 19,
    MEM_WRITE_UNMAPPED: 20,
    MEM_FETCH_UNMAPPED: 21,
    MEM_WRITE_PROT: 22,
    MEM_READ_PROT: 23,
    MEM_FETCH_PROT: 24,
    MEM_READ_AFTER: 25,

    // uc_hook_type
    HOOK_INTR: 1 << 0,
    HOOK_INSN: 1 << 1,
    HOOK_CODE: 1 << 2,
    HOOK_BLOCK: 1 << 3,
    HOOK_MEM_READ_UNMAPPED: 1 << 4,
    HOOK_MEM_WRITE_UNMAPPED: 1 << 5,
    HOOK_MEM_FETCH_UNMAPPED: 1 << 6,
    HOOK_MEM_READ_PROT: 1 << 7,
    HOOK_MEM_WRITE_PROT: 1 << 8,
    HOOK_MEM_FETCH_PROT: 1 << 9,
    HOOK_MEM_READ: 1 << 10,
    HOOK_MEM_WRITE: 1 << 11,
    HOOK_MEM_FETCH: 1 << 12,
    HOOK_MEM_READ_AFTER: 1 << 13,
    HOOK_INSN_INVALID: 1 << 14,
    HOOK_EDGE_GENERATED: 1 << 15,
    HOOK_TCG_OPCODE: 1 << 16,
    HOOK_TLB_FILL: 1 << 17,
    HOOK_MEM_UNMAPPED: (1 << 4) + (1 << 5) + (1 << 6),
    HOOK_MEM_PROT: (1 << 7) + (1 << 8) + (1 << 9),
    HOOK_MEM_READ_INVALID: (1 << 7) + (1 << 4),
    HOOK_MEM_WRITE_INVALID: (1 << 8) + (1 << 5),
    HOOK_MEM_FETCH_INVALID: (1 << 9) + (1 << 6),
    HOOK_MEM_INVALID: (1 << 4) + (1 << 5) + (1 << 6) + (1 << 7) + (1 << 8) + (1 << 9),
    HOOK_MEM_VALID: (1 << 10) + (1 << 11) + (1 << 12),

    // uc_query_type
    QUERY_MODE: 1,
    QUERY_PAGE_SIZE: 2,
    QUERY_ARCH: 3,
    QUERY_TIMEOUT: 4,

    // uc_control_type
    CTL_UC_MODE: 0,
    CTL_UC_PAGE_SIZE: 1,
    CTL_UC_ARCH: 2,
    CTL_UC_TIMEOUT: 3,
    CTL_UC_USE_EXITS: 4,
    CTL_UC_EXITS_CNT: 5,
    CTL_UC_EXITS: 6,
    CTL_CPU_MODEL: 7,
    CTL_TB_REQUEST_CACHE: 8,
    CTL_TB_REMOVE_CACHE: 9,
    CTL_TB_FLUSH: 10,
    CTL_TLB_FLUSH: 11,
    CTL_TLB_TYPE: 12,
    CTL_TCG_BUFFER_SIZE: 13,
    CTL_CONTEXT_MODE: 14,

    // uc_tlb_type
    TLB_CPU: 0,
    TLB_VIRTUAL: 1,

    // uc_context_content
    CTL_CONTEXT_CPU: 1,
    CTL_CONTEXT_MEMORY: 2,

    // uc_prot
    PROT_NONE: 0,
    PROT_READ: 1,
    PROT_WRITE: 2,
    PROT_EXEC: 4,
    PROT_ALL: 7,

    // Version and time-scale macros
    API_MAJOR: 2,
    API_MINOR: 1,
    API_PATCH: 4,
    API_EXTRA: 255,
    VERSION_MAJOR: 2,
    VERSION_MINOR: 1,
    VERSION_PATCH: 4,
    VERSION_EXTRA: 255,
    SECOND_SCALE: 1000000,
    MILISECOND_SCALE: 1000,

    // uc_ctl I/O direction
    CTL_IO_NONE: 0,
    CTL_IO_WRITE: 1,
    CTL_IO_READ: 2,
    CTL_IO_READ_WRITE: 3,

    // UC_CTL control-word builders
    CTL:            (type, nr, rw) => (type | (nr << 26) | (rw << 30)) >>> 0,
    CTL_NONE:       (type, nr) => Module.CTL(type, nr, Module.CTL_IO_NONE),
    CTL_READ:       (type, nr) => Module.CTL(type, nr, Module.CTL_IO_READ),
    CTL_WRITE:      (type, nr) => Module.CTL(type, nr, Module.CTL_IO_WRITE),
    CTL_READ_WRITE: (type, nr) => Module.CTL(type, nr, Module.CTL_IO_READ_WRITE),

    // Static
    version: function() {
        const major_ptr = Module._malloc(4);
        const minor_ptr = Module._malloc(4);
        const ret = Module.ccall('uc_version', 'number',
            ['pointer', 'pointer'], [major_ptr, minor_ptr]);
        const major = Module.getValue(major_ptr, 'i32');
        const minor = Module.getValue(minor_ptr, 'i32');
        Module._free(major_ptr);
        Module._free(minor_ptr);
        return ret;
    },

    arch_supported: function(arch) {
        var ret = Module.ccall('uc_arch_supported', 'number', ['number'], [arch]);
        return ret;
    },

    strerror: function(code) {
        var ret = Module.ccall('uc_strerror', 'string', ['number'], [code]);
        return ret;
    },

    /**
     * Unicorn object
     */
    Unicorn: function (arch, mode) {
        this.arch = arch;
        this.mode = mode;
        this.handle_ptr = Module._malloc(4);

        // Methods
        this.reg_write = function (regid, bytes) {
            // Allocate bytes buffer and copy data
            var buffer_len = bytes.length;
            var buffer_ptr = Module._malloc(buffer_len);
            Module.writeArrayToMemory(bytes, buffer_ptr);
            // Register write
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, buffer_ptr]
            );
            // Free memory and handle return code
            Module._free(buffer_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_write failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.reg_read = function (regid, size) {
            // Allocate space for the output value
            var buffer_ptr = Module._malloc(size);
            for (var i = 0; i < size; i++) {
                Module.setValue(buffer_ptr + i, 0, 'i8');
            }
            // Register read
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, buffer_ptr]
            );
            // Get register value, free memory and handle return code
            var value = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                value[i] = Module.getValue(buffer_ptr + i, 'i8');
            }
            Module._free(buffer_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_read failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            return value;
        }

        this.mem_write = function (address, bytes) {
            // Allocate bytes buffer and copy data
            var buffer_len = bytes.length;
            var buffer_ptr = Module._malloc(buffer_len);
            Module.writeArrayToMemory(bytes, buffer_ptr);

            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_mem_write', 'number',
                ['pointer', 'number', 'pointer', 'number'],
                [handle, BigInt(address || 0), buffer_ptr, BigInt(buffer_len || 0)]
            );
            // Free memory and handle return code
            Module._free(buffer_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_write failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.mem_read = function (address, size) {
            // Allocate space for the output value
            var buffer_ptr = Module._malloc(size);
            for (var i = 0; i < size; i++) {
                Module.setValue(buffer_ptr + i, 0, 'i8');
            }

            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_mem_read', 'number',
                ['pointer', 'number', 'pointer', 'number'],
                [handle, BigInt(address || 0), buffer_ptr, BigInt(size || 0)]
            );
            // Get register value, free memory and handle return code
            var buffer = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                buffer[i] = Module.getValue(buffer_ptr + i, 'i8');
            }
            Module._free(buffer_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_read failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            return buffer;
        }

        this.mem_map = function (address, size, perms) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_mem_map', 'number',
                ['pointer', 'number', 'number', 'number'],
                [handle, BigInt(address || 0), BigInt(size || 0), perms]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_map failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.mem_protect = function (address, size, perms) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_mem_protect', 'number',
                ['pointer', 'number', 'number', 'number'],
                [handle, BigInt(address || 0), BigInt(size || 0), perms]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_protect failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.mem_regions = function () {
            var handle = Module.getValue(this.handle_ptr, '*');
            var regions_ptr_ptr = Module._malloc(4); // uc_mem_region**
            var count_ptr = Module._malloc(4); // uint32_t*
            Module.setValue(regions_ptr_ptr, 0, '*');
            Module.setValue(count_ptr, 0, 'i32');
            var ret = Module.ccall('uc_mem_regions', 'number',
                ['pointer', 'pointer', 'pointer'],
                [handle, regions_ptr_ptr, count_ptr]
            );
            var count = Module.getValue(count_ptr, 'i32');
            var regions_ptr = Module.getValue(regions_ptr_ptr, '*');
            Module._free(regions_ptr_ptr);
            Module._free(count_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_regions failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            var regions = [];
            for (var i = 0; i < count; i++) {
                var base = regions_ptr + i * 24; // sizeof(uc_mem_region)
                regions.push({
                    begin: Module.getValue(base, 'i64'),
                    end:   Module.getValue(base + 8, 'i64'),
                    perms: Module.getValue(base + 16, 'i32'),
                });
            }
            if (regions_ptr) {
                Module.ccall('uc_free', 'number', ['pointer'], [regions_ptr]);
            }
            return regions;
        }

        this.mem_unmap = function (address, size) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_mem_unmap', 'number',
                ['pointer', 'number', 'number'],
                [handle, BigInt(address || 0), BigInt(size || 0)]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_unmap failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.hook_add = function (type, user_callback, user_data, begin, end, extra) {
            var handle = Module.getValue(this.handle_ptr, '*');
            // Default arguments
            if (typeof user_data === 'undefined') {
                user_data = {}
            }
            if (typeof begin === 'undefined' &&
                typeof end === 'undefined') {
                begin = 1;
                end = 0;
            }
            // Wrap callback
            var extra_types = ['number'];
            var extra_values = [extra];
            switch (type) {
                case Module.HOOK_INSN:
                    extra_types = ['number'];
                    extra_values = [extra];
                    var callback = (function (handle, user_data) {
                        return function (_, _2) {
                            user_callback(handle, user_data);
                        }
                    })(this, user_data);
                    var callback_ptr = Module.addFunction(callback, 'vii');
                    break;
                // uc_cb_hookintr_t
                case Module.HOOK_INTR:
                    var callback = (function (handle, user_data) {
                        return function (_, intno, _2) {
                            user_callback(handle, intno, user_data);
                        }
                    })(this, user_data);
                    var callback_ptr = Module.addFunction(callback, 'viii');
                    break;
                // uc_cb_hookcode_t
                case Module.HOOK_CODE:
                case Module.HOOK_BLOCK:
                    var callback = (function (handle, user_data) {
                        return function (_, address, size, _2) {
                            user_callback(handle, address, size, user_data);
                        }
                    })(this, user_data);
                    // uc_cb_hookcode_t: void(uc, uint64_t address, uint32_t size, void*)
                    // -> the 64-bit address crosses to JS as a BigInt ('j').
                    var callback_ptr = Module.addFunction(callback, 'vijii');
                    break;
                default:
                    // uc_cb_hookmem_t
                    if ((type & Module.HOOK_MEM_READ) ||
                        (type & Module.HOOK_MEM_WRITE) ||
                        (type & Module.HOOK_MEM_FETCH) ||
                        (type & Module.HOOK_MEM_READ_AFTER)) {
                        var callback = (function (handle, user_data) {
                            return function (_, type, address, size, value, _2) {
                                user_callback(handle, type, address, size, value, user_data);
                            }
                        })(this, user_data);
                        // uc_cb_hookmem_t: void(uc, type, uint64_t address, int size, int64_t value, void*)
                        var callback_ptr = Module.addFunction(callback, 'viijiji');
                    }
                    // uc_cb_eventmem_t
                    if ((type & Module.HOOK_MEM_READ_UNMAPPED) ||
                        (type & Module.HOOK_MEM_WRITE_UNMAPPED) ||
                        (type & Module.HOOK_MEM_FETCH_UNMAPPED) ||
                        (type & Module.HOOK_MEM_READ_PROT) ||
                        (type & Module.HOOK_MEM_WRITE_PROT) ||
                        (type & Module.HOOK_MEM_FETCH_PROT)) {
                        var callback = (function (handle, user_data) {
                            return function (_, type, address, size, value, _2) {
                                return user_callback(handle, type, address, size, value, user_data);
                            }
                        })(this, user_data);
                        // uc_cb_eventmem_t: bool(uc, type, uint64_t address, int size, int64_t value, void*)
                        var callback_ptr = Module.addFunction(callback, 'iiijiji');
                    }
            }
            if (typeof callback === 'undefined') {
                throw 'Unicorn.js: Unimplemented hook type'
            }
            // Set hook
            var hook_ptr = Module._malloc(4);
            var valist_ptr = Module._malloc(8);
            Module.setValue(valist_ptr, extra || 0, 'i32');
            var ret = Module.ccall('uc_hook_add', 'number',
                ['pointer', 'pointer', 'number', 'pointer', 'pointer', 'number', 'number', 'pointer'],
                [handle, hook_ptr, type, callback_ptr, 0, BigInt(begin || 0), BigInt(end || 0), valist_ptr]
            );
            Module._free(valist_ptr);
            if (ret != Module.ERR_OK) {
                Module.removeFunction(callback_ptr);
                Module._free(hook_ptr);
                var error = 'Unicorn.js: Function uc_hook_add failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            var hook = {
                handle: Module.getValue(hook_ptr, '*'),
                callback: callback_ptr
            };
            Module._free(hook_ptr);
            return hook
        }

        this.hook_del = function (hook) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_hook_del', 'number',
                ['pointer', 'pointer'],
                [handle, hook.handle]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_unmap failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            Module.removeFunction(hook.callback);
        }

        this.emu_start = function (begin, until, timeout, count) {
            // begin/until/timeout are uint64_t -> BigInt; count is size_t.
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_emu_start', 'number',
                ['pointer', 'number', 'number', 'number', 'number'],
                [handle, BigInt(begin || 0), BigInt(until || 0),
                 BigInt(timeout || 0), count]
            );
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_emu_start failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.emu_stop = function () {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_emu_stop', 'number', ['pointer'], [handle]);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_emu_stop failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        // Snapshot/restore of CPU context. context_alloc() returns an opaque
        // uc_context* handle to pass to context_save/restore and, when done,
        // context_free (uc_context_alloc sizes it for this engine internally).
        this.context_alloc = function () {
            var handle = Module.getValue(this.handle_ptr, '*');
            var context_ptr_ptr = Module._malloc(4); // uc_context**
            Module.setValue(context_ptr_ptr, 0, '*');
            var ret = Module.ccall('uc_context_alloc', 'number',
                ['pointer', 'pointer'], [handle, context_ptr_ptr]);
            var context = Module.getValue(context_ptr_ptr, '*');
            Module._free(context_ptr_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_context_alloc failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            return context;
        }

        this.context_free = function (context) {
            var ret = Module.ccall('uc_context_free', 'number',
                ['pointer'], [context]);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_context_free failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.context_save = function (context) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_context_save', 'number',
                ['pointer', 'pointer'], [handle, context]);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_context_save failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.context_restore = function (context) {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_context_restore', 'number',
                ['pointer', 'pointer'], [handle, context]);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_context_restore failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        this.errno = function() {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_errno', 'number', ['pointer'], [handle]);
            return ret;
        }

        this.close = function() {
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_close', 'number', ['pointer'], [handle]);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_close failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        // Helpers
        this._sizeof = function (type) {
            switch (type) {
                case 'i8':     return 1;
                case 'i16':    return 2;
                case 'i32':    return 4;
                case 'i64':    return 8;
                case 'float':  return 4;
                case 'double': return 8;
                default:       return 0;
            }
        }
        this.reg_write_type = function (regid, type, value) {
            // Allocate space for the input value
            var value_size = this._sizeof(type);
            var value_ptr = Module._malloc(value_size);
            Module.setValue(value_ptr, value, type);
            // Register write
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Free memory and handle return code
            Module._free(value_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_write failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }
        this.reg_write_i8     = function (regid, value) { this.reg_write_type(regid, 'i8', value); }
        this.reg_write_i16    = function (regid, value) { this.reg_write_type(regid, 'i16', value); }
        this.reg_write_i32    = function (regid, value) { this.reg_write_type(regid, 'i32', value); }
        this.reg_write_i64    = function (regid, value) { this.reg_write_type(regid, 'i64', value); }
        this.reg_write_float  = function (regid, value) { this.reg_write_type(regid, 'float', value); }
        this.reg_write_double = function (regid, value) { this.reg_write_type(regid, 'double', value); }

        this.reg_read_type = function (regid, type) {
            // Allocate zero-initialized space for the output value
            var value_size = this._sizeof(type);
            var value_ptr = Module._malloc(value_size);
            Module.setValue(value_ptr, 0, type);

            // Register read
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Read back the value: 64-bit integers come back as BigInt
            // (WASM_BIGINT), narrower integer types and floats as Number.
            var value = Module.getValue(value_ptr, type);
            Module._free(value_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_read failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            return value;
        }
        this.reg_read_i8      = function (regid) { return this.reg_read_type(regid, 'i8'); }
        this.reg_read_i16     = function (regid) { return this.reg_read_type(regid, 'i16'); }
        this.reg_read_i32     = function (regid) { return this.reg_read_type(regid, 'i32'); }
        this.reg_read_i64     = function (regid) { return this.reg_read_type(regid, 'i64'); }
        this.reg_read_float   = function (regid) { return this.reg_read_type(regid, 'float'); }
        this.reg_read_double  = function (regid) { return this.reg_read_type(regid, 'double'); }

        this.query_type = function (query_type, result_type) {
            // Allocate space for the output value
            var result_size = this._sizeof(result_type);
            var result_ptr = Module._malloc(result_size);
            if (result_type === 'i64') {
                Module.setValue(result_ptr, 0n, 'i64');
            } else {
                Module.setValue(result_ptr, 0, result_type);
            }
            // Make query
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_query', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, query_type, result_ptr]
            );
            // Read back the result (64-bit as BigInt under WASM_BIGINT), then free.
            var result = Module.getValue(result_ptr, result_type);
            Module._free(result_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_query failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
            return result;
        }
        this.query_i8      = function (type) { return this.query_type(type, 'i8'); }
        this.query_i16     = function (type) { return this.query_type(type, 'i16'); }
        this.query_i32     = function (type) { return this.query_type(type, 'i32'); }
        this.query_i64     = function (type) { return this.query_type(type, 'i64'); }
        this.query_float   = function (type) { return this.query_type(type, 'float'); }
        this.query_double  = function (type) { return this.query_type(type, 'double'); }

        this.ctl = function (control, args) {
            args = args || [];
            // Lay out the varargs buffer with each argument naturally aligned.
            var offsets = [];
            var off = 0;
            for (var i = 0; i < args.length; i++) {
                var size = (args[i].type === 'i64') ? 8 : 4;
                off = Math.ceil(off / size) * size;
                offsets.push(off);
                off += size;
            }
            var valist_ptr = Module._malloc(off || 8);
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (arg.type === 'i64') {
                    Module.setValue(valist_ptr + offsets[i], BigInt(arg.value || 0), 'i64');
                } else if (arg.type === 'ptr') {
                    Module.setValue(valist_ptr + offsets[i], arg.value || 0, '*');
                } else {
                    Module.setValue(valist_ptr + offsets[i], arg.value, 'i32');
                }
            }
            var handle = Module.getValue(this.handle_ptr, '*');
            var ret = Module.ccall('uc_ctl', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, control >>> 0, valist_ptr]
            );
            Module._free(valist_ptr);
            if (ret != Module.ERR_OK) {
                var error = 'Unicorn.js: Function uc_ctl failed with code ' + ret + ':\n' + Module.strerror(ret);
                throw error;
            }
        }

        // Read a single scalar control through an output pointer argument.
        this._ctl_read = function (type, nr, out_type) {
            var out_ptr = Module._malloc(this._sizeof(out_type));
            Module.setValue(out_ptr, out_type === 'i64' ? 0n : 0, out_type);
            this.ctl(Module.CTL_READ(type, nr),
                [{ type: 'ptr', value: out_ptr }]);
            var value = Module.getValue(out_ptr, out_type);
            Module._free(out_ptr);
            return value;
        }

        // Write a single i32 scalar control passed by value.
        this._ctl_write = function (type, nr, value) {
            this.ctl(Module.CTL_WRITE(type, nr),
                [{ type: 'i32', value: value }]);
        }

        this.ctl_context_mode
            = (mode) => this._ctl_write(Module.CTL_CONTEXT_MODE, 1, mode);
        this.ctl_exits_disable
            = () => this._ctl_write(Module.CTL_UC_USE_EXITS, 1, 0);
        this.ctl_exits_enable
            = () => this._ctl_write(Module.CTL_UC_USE_EXITS, 1, 1);
        this.ctl_flush_tb
            = () => this.ctl(Module.CTL_WRITE(Module.CTL_TB_FLUSH, 0));
        this.ctl_flush_tlb
            = () => this.ctl(Module.CTL_WRITE(Module.CTL_TLB_FLUSH, 0));
        this.ctl_get_arch
            = () => this._ctl_read(Module.CTL_UC_ARCH, 1, 'i32');
        this.ctl_get_cpu_model
            = () => this._ctl_read(Module.CTL_CPU_MODEL, 1, 'i32');
        this.ctl_get_exits_cnt
            = () => this._ctl_read(Module.CTL_UC_EXITS_CNT, 1, 'i32');
        this.ctl_get_mode
            = () => this._ctl_read(Module.CTL_UC_MODE, 1, 'i32');
        this.ctl_get_page_size
            = () => this._ctl_read(Module.CTL_UC_PAGE_SIZE, 1, 'i32');
        this.ctl_get_tcg_buffer_size
            = () => this._ctl_read(Module.CTL_TCG_BUFFER_SIZE, 1, 'i32');
        this.ctl_get_timeout
            = () => this._ctl_read(Module.CTL_UC_TIMEOUT, 1, 'i64');
        this.ctl_set_cpu_model
            = (model) => this._ctl_write(Module.CTL_CPU_MODEL, 1, model);
        this.ctl_set_page_size
            = (size) => this._ctl_write(Module.CTL_UC_PAGE_SIZE, 1, size);
        this.ctl_set_tcg_buffer_size
            = (size) => this._ctl_write(Module.CTL_TCG_BUFFER_SIZE, 1, size);
        this.ctl_tlb_mode
            = (mode) => this._ctl_write(Module.CTL_TLB_TYPE, 1, mode);

        // Multiple-exit controls: exits are an array of uint64_t (BigInt).
        this.ctl_get_exits = function (count) {
            var buffer_ptr = Module._malloc(count * 8 || 8);
            this.ctl(Module.CTL_READ(Module.CTL_UC_EXITS, 2),
                [{ type: 'ptr', value: buffer_ptr }, { type: 'i32', value: count }]);
            var exits = [];
            for (var i = 0; i < count; i++) {
                exits.push(Module.getValue(buffer_ptr + i * 8, 'i64'));
            }
            Module._free(buffer_ptr);
            return exits;
        }
        this.ctl_set_exits = function (exits) {
            var count = exits.length;
            var buffer_ptr = Module._malloc(count * 8 || 8);
            for (var i = 0; i < count; i++) {
                Module.setValue(buffer_ptr + i * 8, BigInt(exits[i] || 0), 'i64');
            }
            this.ctl(Module.CTL_WRITE(Module.CTL_UC_EXITS, 2),
                [{ type: 'ptr', value: buffer_ptr }, { type: 'i32', value: count }]);
            Module._free(buffer_ptr);
        }

        // Translation-block cache controls (addresses are uint64_t -> BigInt).
        this.ctl_remove_cache = function (address, end) {
            this.ctl(Module.CTL_WRITE(Module.CTL_TB_REMOVE_CACHE, 2),
                [{ type: 'i64', value: address }, { type: 'i64', value: end }]);
        }
        this.ctl_request_cache = function (address) {
            var tb_ptr = Module._malloc(16); // uc_tb { uint64_t pc; uint16_t icount; uint16_t size; }
            for (var i = 0; i < 16; i++) {
                Module.setValue(tb_ptr + i, 0, 'i8');
            }
            this.ctl(Module.CTL_READ_WRITE(Module.CTL_TB_REQUEST_CACHE, 2),
                [{ type: 'i64', value: address }, { type: 'ptr', value: tb_ptr }]);
            var tb = {
                pc:     Module.getValue(tb_ptr, 'i64'),
                icount: Module.getValue(tb_ptr + 8, 'i16'),
                size:   Module.getValue(tb_ptr + 10, 'i16'),
            };
            Module._free(tb_ptr);
            return tb;
        }

        // Constructor
        var ret = Module.ccall('uc_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );
        if (ret != Module.ERR_OK) {
            Module.setValue(this.handle_ptr, 0, '*');
            var error = 'Unicorn.js: Function uc_open failed with code ' + ret + ':\n' + Module.strerror(ret);
            throw error;
        }
    }
});
