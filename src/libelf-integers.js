/**
 * (c) 2018 Libelf.JS
 * Arbitrary integer emulation
 * Based on https://github.com/pierrec/js-cuint
 */

var ElfUInt = function (width) {
    // Configure properties based on bit-width
    var mask = (1 << (((width - 1) % 16) + 1)) - 1;
    var nchunks = (width + 15) / 16;

    // Return class
    return function (value) {
        this.width = width;
        this.chunks = new Uint16Array(nchunks);
        this.mask = mask;

        // Initialization:
        // Several checks are omitted since JavaScript will cast any undefined/NaN's
        // into the appropriate type while writing to the chunks array.
        if (value == null) {
            this.chunks.fill(0);
        } else {
            // Initialize from Number
            if (typeof value === 'number') {
                if (!Number.isSafeInteger(value)) {
                    console.warn(
                        'Libelf.js: number ' + value +
                        ' is beyond 53 bits integer precision, use other initialization formats for better precision'
                    );
                }
                if (value > Math.pow(2, this.width)-1 || value < -Math.pow(2, this.width-1)) {
                    console.warn(
                        'Libelf.js: number ' + value +
                        ' overflows ' + this.width + ' bits width, use larger width to keep higher bits'
                    );
                }
                for (var i = 0; i < this.chunks.length; i++) {
                    // Apply mask on the last chunk to cast to correct width
                    this.chunks[i] = value & (i === this.chunks.length - 1 ? this.mask : 0xFFFF);
                    if (value < 0) {
                        // Fix round off of bits in negative values
                        value -= 0xFFFF;
                    }
                    value /= 0x10000;
                }
            }
            // Initialize from String
            if (typeof value === 'string') {
                if (value.toLowerCase().startsWith("0x"))
                    value = value.slice(2);
                for (var i = 0; i < this.chunks.length; i++) {
                    // Force NaN value to be 0
                    this.chunks[i] = parseInt(value.slice(-4), 16) | 0;
                    value.slice(0, -4);
                }
            }
            // Initialize from Array (32-bit entries)
            if (typeof value === 'object' && Array.isArray(value)) {
                for (var i = 0; i < this.chunks.length; i++) {
                    if (i % 2 == 0)
                        this.chunks[i] = (value[(i/2)|0] >>>  0) & 0xFFFF;
                    else
                        this.chunks[i] = (value[(i/2)|0] >>> 16) & 0xFFFF;
                }
            }
            // Initialize from ElfUInt
            if (typeof value === 'object' && !Array.isArray(value)) {
                for (var i = 0; i < this.chunks.length; i++) {
                    this.chunks[i] = value.chunks[i];
                }
            }
        }

        // Methods
        this.clone = function () {
        };

        this.neg = function () {
            return this.not().add(1);
        };
        this.not = function () {
            var value = new this.constructor(this);
            for (var i = 0; i < this.chunks.length; i++)
                value.chunks[i] = ~this.chunks[i];
            return value;
        };
        this.add = function (rhs) {
            var lhs = new this.constructor(this);
            var rhs = new this.constructor(rhs);
            var carry = 0;
            for (var i = 0; i < this.chunks.length; i++) {
                var chunk_lhs = lhs.chunks[i];
                var chunk_rhs = rhs.chunks[i];
                lhs.chunks[i] = chunk_lhs + chunk_rhs + carry;
                carry = ((chunk_lhs + chunk_rhs + carry) > 0xFFFF) ? 1 : 0;
            }
            return lhs;
        };
        this.sub = function (rhs) {
            var lhs = new this.constructor(this);
            var rhs = new this.constructor(rhs);
            return this.add(rhs.neg());
        };
        this.mul = function (rhs) {
            var lhs = new this.constructor(this);
            var rhs = new this.constructor(rhs);
            return lhs;
        };
        this.div = function (rhs) {
            var lhs = new this.constructor(this);
            var rhs = new this.constructor(rhs);
            return lhs;
        };
        this.shl = function (amount) {
            var value = new this.constructor(this);
            return value;
        };
        this.shr = function (amount) {
            var value = new this.constructor(this);
            return value;
        };
        this.ror = function (amount) {
            var value = new this.constructor(this);
            return value;
        };
        this.rol = function (amount) {
            var value = new this.constructor(this);
            return value;
        };

        // Conversion
        this.hex = function () {
            var string = "0x";
            for (var i = this.chunks.length - 1; i >= 0; i--) {
                var chunkstr = this.chunks[i].toString(16);
                chunkstr = "0".repeat(4 - chunkstr.length) + chunkstr;
                string += chunkstr;
            }
            return string;
        }
        this.num = function () {
            var number = 0;
            for (var i = this.chunks.length - 1; i >= 0; i--)
                number = (number * 0x10000) + this.chunks[i];
            if (!Number.isSafeInteger(number)) {
                console.warn(
                    'Libelf.js: number ' + number +
                    ' is beyond 53 bits integer precision, use other conversion formats for better precision'
                );
            }
            return number;
        }

        // Overrides
        this.valueOf = this.num;
    };
};

var ElfUInt8  = ElfUInt(8);
var ElfUInt16 = ElfUInt(16);
var ElfUInt32 = ElfUInt(32);
var ElfUInt64 = ElfUInt(64);
