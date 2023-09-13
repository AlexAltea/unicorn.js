/**
 * (c) 2016-2017 Unicorn.JS
 * Wrapper made by Alexandro Sanchez Bach.
 */

// Emscripten demodularize
var MUnicorn = new MUnicorn();

// Number conversion modes
ELF_INT_NUMBER  = 1
ELF_INT_STRING  = 2
ELF_INT_OBJECT  = 3

var uc = {
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
        this.reg_write = function (regid, bytes) {
            // Allocate bytes buffer and copy data
            var buffer_len = bytes.length;
            var buffer_ptr = MUnicorn._malloc(buffer_len);
            MUnicorn.writeArrayToMemory(bytes, buffer_ptr);
            // Register write
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, buffer_ptr]
            );
            // Free memory and handle return code
            MUnicorn._free(buffer_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_write failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.reg_read = function (regid, size) {
            // Allocate space for the output value
            var buffer_ptr = MUnicorn._malloc(size);
            for (var i = 0; i < size; i++) {
                MUnicorn.setValue(buffer_ptr + i, 0, 'i8');
            }
            // Register read
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, buffer_ptr]
            );
            // Get register value, free memory and handle return code
            var value = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                value[i] = MUnicorn.getValue(buffer_ptr + i, 'i8');
            }
            MUnicorn._free(buffer_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_read failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
            return value;
        }

        this.mem_write = function (address, bytes) {
            // Allocate bytes buffer and copy data
            var buffer_len = bytes.length;
            var buffer_ptr = MUnicorn._malloc(buffer_len);
            MUnicorn.writeArrayToMemory(bytes, buffer_ptr);
            
            // Convert address types
            var [addr_lo, addr_hi] = this.__address(address);

            // Write to memory
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_write', 'number',
                ['pointer', 'number', 'number', 'pointer', 'number'],
                [handle, addr_lo, addr_hi, buffer_ptr, buffer_len]
            );
            // Free memory and handle return code
            MUnicorn._free(buffer_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_write failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.mem_read = function (address, size) {
            // Allocate space for the output value
            var buffer_ptr = MUnicorn._malloc(size);
            for (var i = 0; i < size; i++) {
                MUnicorn.setValue(buffer_ptr + i, 0, 'i8');
            }
            
            // Convert address types
            var [addr_lo, addr_hi] = this.__address(address);

            // Read from memory
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_read', 'number',
                ['pointer', 'number', 'number', 'pointer', 'number'],
                [handle, addr_lo, addr_hi, buffer_ptr, size]
            );
            // Get register value, free memory and handle return code
            var buffer = new Uint8Array(size);
            for (var i = 0; i < size; i++) {
                buffer[i] = MUnicorn.getValue(buffer_ptr + i, 'i8');
            }
            MUnicorn._free(buffer_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_read failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
            return buffer;
        }

        this.mem_map = function (address, size, perms) {
            // Convert address types
            var [addr_lo, addr_hi] = this.__address(address);
            
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_map', 'number',
                ['pointer', 'number', 'number', 'number', 'number'],
                [handle, addr_lo, addr_hi, size, perms]
            );
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_map failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.mem_protect = function (address, size, perms) {
            // Convert address types
            var [addr_lo, addr_hi] = this.__address(address);
            
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_protect', 'number',
                ['pointer', 'number', 'number', 'number', 'number'],
                [handle, addr_lo, addr_hi, size, perms]
            );
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_protect failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.mem_regions = function () {
            console.error("Unicorn.js: Method mem_regions unimplemented");
        }

        this.mem_unmap = function (address, size) {
            // Convert address types
            var [addr_lo, addr_hi] = this.__address(address);
            
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_mem_unmap', 'number',
                ['pointer', 'number', 'number', 'number'],
                [handle, addr_lo, addr_hi, size]
            );
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_unmap failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.hook_add = function (type, user_callback, user_data, begin, end, extra) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
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
                case uc.HOOK_INSN:
                    extra_types = ['number'];
                    extra_values = [extra];
                    var callback = (function (handle, user_data) {
                        return function (_, _2) {
                            user_callback(handle, user_data);
                        }
                    })(this, user_data);
                    var callback_ptr = MUnicorn.addFunction(callback, 'vii');
                    break;
                // uc_cb_hookintr_t
                case uc.HOOK_INTR:
                    var callback = (function (handle, user_data) {
                        return function (_, intno, _2) {
                            user_callback(handle, intno, user_data);
                        }
                    })(this, user_data);
                    var callback_ptr = MUnicorn.addFunction(callback, 'viii');
                    break;
                // uc_cb_hookcode_t
                case uc.HOOK_CODE:
                case uc.HOOK_BLOCK:
                    var callback = (function (handle, user_data) {
                        return function (_, addr_lo, addr_hi, size, _2) {
                            user_callback(handle, addr_lo, addr_hi, size, user_data);
                        }
                    })(this, user_data);
                    var callback_ptr = MUnicorn.addFunction(callback, 'viiii');
                    break;
                default:
                    // uc_cb_hookmem_t
                    if ((type & uc.HOOK_MEM_READ) ||
                        (type & uc.HOOK_MEM_WRITE) ||
                        (type & uc.HOOK_MEM_FETCH) ||
                        (type & uc.HOOK_MEM_READ_AFTER)) {
                        var callback = (function (handle, user_data) {
                            return function (_, type, addr_lo, addr_hi, size, value_lo, value_hi, _2) {
                                user_callback(handle, type, addr_lo, addr_hi, size, value_lo, value_hi, user_data);
                            }
                        })(this, user_data);
                        var callback_ptr = MUnicorn.addFunction(callback, 'viiiiiiii');
                    }
                    // uc_cb_eventmem_t
                    if ((type & uc.HOOK_MEM_READ_UNMAPPED) ||
                        (type & uc.HOOK_MEM_WRITE_UNMAPPED) ||
                        (type & uc.HOOK_MEM_FETCH_UNMAPPED) ||
                        (type & uc.HOOK_MEM_READ_PROT) ||
                        (type & uc.HOOK_MEM_WRITE_PROT) ||
                        (type & uc.HOOK_MEM_FETCH_PROT)) {
                        var callback = (function (handle, user_data) {
                            return function (_, type, addr_lo, addr_hi, size, value_lo, value_hi, _2) {
                                return user_callback(handle, type, addr_lo, addr_hi, size, value_lo, value_hi, user_data);
                            }
                        })(this, user_data);
                        var callback_ptr = MUnicorn.addFunction(callback, 'iiiiiiiii');
                    }
            }
            if (typeof callback === 'undefined') {
                throw 'Unicorn.js: Unimplemented hook type'
            }
            // Set hook
            var hook_ptr = MUnicorn._malloc(4);
            var ret = MUnicorn.ccall('uc_hook_add', 'number',
                ['pointer', 'pointer', 'number', 'pointer', 'pointer',
                    'number', 'number', 'number', 'number', 'number'],
                [handle, hook_ptr, type, callback_ptr, 0,
                    begin, 0, end, 0, extra]
            );
            if (ret != uc.ERR_OK) {
                MUnicorn.removeFunction(callback_ptr);
                MUnicorn._free(hook_ptr);
                var error = 'Unicorn.js: Function uc_mem_unmap failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
            var hook = {
                handle: MUnicorn.getValue(hook_ptr, '*'),
                callback: callback_ptr
            };
            MUnicorn._free(hook_ptr);
            return hook
        }

        this.hook_del = function (hook) {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_hook_del', 'number',
                ['pointer', 'pointer'],
                [handle, hook.handle]
            );
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_mem_unmap failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
            MUnicorn.removeFunction(hook.callback);
        }

        this.emu_start = function (begin, until, timeout, count) {
            var [begin_lo, begin_hi] = this.__address(begin);
            var [until_lo, until_hi] = this.__address(until);

            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_emu_start', 'number',
                ['pointer', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
                [handle, begin_lo, begin_hi, until_lo, until_hi,
                 timeout, 0, count]
            );
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_emu_start failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.emu_stop = function () {
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_emu_stop', 'number', ['pointer'], [handle]);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_emu_stop failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        this.context_alloc = function () {
            console.error('Unicorn.js: Contexts not implemented');
        }

        this.context_free = function () {
            console.error('Unicorn.js: Contexts not implemented');
        }

        this.context_save = function () {
            console.error('Unicorn.js: Contexts not implemented');
        }

        this.context_restore = function () {
            console.error('Unicorn.js: Contexts not implemented');
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
                var error = 'Unicorn.js: Function uc_close failed with code ' + ret + ':\n' + uc.strerror(ret);
                throw error;
            }
        }

        // Helpers
        this.__integer = function (value, width) {
            if (typeof value === "number") {
                value = [value];
            }
            switch (this.get_integer_type()) {
            case ELF_INT_NUMBER:
                return value[0];
            case ELF_INT_STRING:
                return value
                    .map(x => x.toString(16).toUpperCase())
                    .map(x => '0'.repeat(width/4 - x.length) + x)
                    .reverse().join('');
            case ELF_INT_OBJECT:
                switch (width) {
                case 8:  return new ElfUInt8(value);
                case 16: return new ElfUInt16(value);
                case 32: return new ElfUInt32(value);
                case 64: return new ElfUInt64(value);
                default: throw 'Unexpected width';
                }
            default:
                var error = 'Unimplemented integer type';
                throw error;
            }
        }
        this.__address = function (address) {
            var address_obj = new ElfUInt64(address);
            return [address_obj.chunks[0] + (address_obj.chunks[1]<<16), address_obj.chunks[2] + (address_obj.chunks[3]<<16)];
        }
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
            // Allocate space for the output value
            var value_size = this._sizeof(type);
            var value_ptr = MUnicorn._malloc(value_size);
            // Convert integer types
            var value_obj = new (ElfUInt(value_size*8))(value);
            for (var i = 0; i < value_size/2; i++) {
                MUnicorn.setValue(value_ptr + i*2, value_obj.chunks[i], 'i16');
            }
            // Register write
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_write', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Free memory and handle return code
            MUnicorn._free(value_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_write failed with code ' + ret + ':\n' + uc.strerror(ret);
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
            // Allocate space for the output value
            var value_size = this._sizeof(type);
            var value_ptr = MUnicorn._malloc(value_size);
            MUnicorn.setValue(value_ptr, 0, type);

            // Register read
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_reg_read', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, regid, value_ptr]
            );
            // Get register value, free memory and handle return code
            var value = MUnicorn.getValue(value_ptr, type);
            if (type === 'i64') {
                    value = [value, MUnicorn.getValue(value_ptr+4, 'i32')]
            }
            // Convert integer types
            if (type.includes('i')) {
                value = this.__integer(value, value_size*8);
            }
            MUnicorn._free(value_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_reg_read failed with code ' + ret + ':\n' + uc.strerror(ret);
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
            var result_ptr = MUnicorn._malloc(result_size);
            MUnicorn.setValue(value_ptr, 0, result_type);
            // Make query
            var handle = MUnicorn.getValue(this.handle_ptr, '*');
            var ret = MUnicorn.ccall('uc_query', 'number',
                ['pointer', 'number', 'pointer'],
                [handle, query_type, result_ptr]
            );
            // Get result value, free memory and handle return code
            var result = MUnicorn.getValue(result_ptr, result_type);
            if (type === 'i64') {
                result = [result, MUnicorn.getValue(result_ptr+4, 'i32')]
            }
            // Convert integer types
            if (type.includes('i')) {
                result = this.__integer(result, result_size*8);
            }
            MUnicorn._free(result_ptr);
            if (ret != uc.ERR_OK) {
                var error = 'Unicorn.js: Function uc_query failed with code ' + ret + ':\n' + uc.strerror(ret);
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
        
        // Configuration
        this.get_integer_type = function () {
            // Using ELF_INT_NUMBER as default for 32 bit backward compatibility
            if (this.integer_type == null) {
                return ELF_INT_NUMBER;
            }
            return this.integer_type;
        }

        this.set_integer_type = function (type) {
            // Please Use ELF_INT_STRING/ELF_INT_OBJECT for 64 bit support
            this.integer_type = type;
        }

        // Constructor
        var ret = MUnicorn.ccall('uc_open', 'number',
            ['number', 'number', 'pointer'],
            [this.arch, this.mode, this.handle_ptr]
        );
        if (ret != uc.ERR_OK) {
            MUnicorn.setValue(this.handle_ptr, 0, '*');
            var error = 'Unicorn.js: Function uc_open failed with code ' + ret + ':\n' + uc.strerror(ret);
            throw error;
        }
    }
};
