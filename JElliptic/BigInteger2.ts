class BigInteger2 {
    static MAX_SAFE_INT = 9007199254740991; // 2^53-1, where 53 is the mantissa size of IEEE-754 double-precision floating point numbers (what JS uses)
    static BASE = 10000000; // largest power of 10 smaller than sqrt(MAX_SAFE_INT)/2; also needs to be even
    static BASE_LOG10 = Math.floor(Math.log(BigInteger2.BASE) / Math.log(10));


    _digits: number[]; // base BASE

    static ZERO = BigInteger2.uncheckedCreate([0]);
    static ONE = BigInteger2.uncheckedCreate([1]);

    /** O(1) */
    static fromInt(n: number): BigInteger2 {
        if (Math.abs(n) > BigInteger2.MAX_SAFE_INT) {
            throw "BigInteger2.fromInt cannot be called with inexact integers.";
        }

        var digits = Array<number>();

        n = Math.abs(n);

        do {
            var rem = n % BigInteger2.BASE;
            n = Math.floor(n / BigInteger2.BASE);

            digits.push(rem);
        } while (n != 0);

        return BigInteger2.create(digits);
    }

    /** O(str.length) */
    static parse(str: string): BigInteger2 {
        // trim leading 0s
        var begin = 0;
        while (str[begin] == "0") {
            begin++;
        }
        str = str.substring(begin);

        var chunksLength = Math.ceil(str.length / BigInteger2.BASE_LOG10);
        var chunks: string[] = [];

        for (var n = 0; n < chunksLength; n++) {
            var end = str.length - n * BigInteger2.BASE_LOG10;
            chunks[n] = str.substring(Math.max(0, end - BigInteger2.BASE_LOG10), end);
        }

        return BigInteger2.create(chunks.map(Number));
    }

    /** O(max(this.digits, other.digits)) */
    add(other: BigInteger2): BigInteger2 {
        var digits = Array<number>();
        var carry = 0;

        var hi = this._digits;
        var lo = other._digits;

        if (this._digits.length < other._digits.length) {
            hi = other._digits;
            lo = this._digits;
        }

        var n = 0;

        for (; n < lo.length; n++) {
            var current = hi[n] + lo[n] + carry;

            if (current >= BigInteger2.BASE) {
                carry = 1;
                current -= BigInteger2.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        for (; carry == 1 && n < hi.length; n++) {
            var current = hi[n] + carry;

            if (current >= BigInteger2.BASE) {
                carry = 1;
                current -= BigInteger2.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        if (carry == 0) {
            for (; n < hi.length; n++) {
                digits[n] = hi[n];
            }
        }
        else {
            digits[n] = 1;
        }

        return BigInteger2.create(digits);
    }


    /** O(max(this.digits, other.digits)^log_2(3)) */
    mul(other: BigInteger2): BigInteger2 {
        var digits = Array<number>(this._digits.length + other._digits.length);
        // Initialize all digits, otherwise funky stuff happens with 'undefined'
        for (var n = 0; n < digits.length; n++) {
            digits[n] = 0;
        }

        for (var n = 0; n < this._digits.length; n++) {
            var carry = 0;
            for (var k = 0; k < other._digits.length; k++) {
                var sum = digits[n + k] + this._digits[n] * other._digits[k] + carry;
                carry = Math.floor(sum / BigInteger2.BASE);
                sum = sum - BigInteger2.BASE * carry;
                digits[n + k] = sum;
            }
            if (carry != 0) {
                // We can safely use = and no + here, as this cell hasn't been set yet
                digits[n + other._digits.length] = carry;
            }
        }

        return BigInteger2.create(digits);
    }

    /** O(this.digits) */
    toString(): string {
        var padNum = (n: number, len: number): string => {
            var str = n.toString();
            while (str.length < len) {
                str = '0' + str;
            }
            return str;
        }

        var result = "";

        for (var n = 0; n < this._digits.length - 1; n++) {
            result = padNum(this._digits[n], BigInteger2.BASE_LOG10) + result;
        }
        result = this._digits[this._digits.length - 1].toString() + result;

        return result;
    }

    /** O(digits) */
    private static create(digits: number[]): BigInteger2 {
        // Remove useless digits
        var actualLength = digits.length;
        // Boolean NOT on a number also takes care of undefined
        while (actualLength > 0 && !digits[actualLength - 1]) {
            actualLength--;
        }

        if (actualLength == 0) {
            return BigInteger2.ZERO;
        }

        var bi = new BigInteger2();
        bi._digits = digits.slice(0, actualLength);
        return bi;
    }

    /** O(1) */
    private static uncheckedCreate(digits: number[]): BigInteger2 {
        var bi = new BigInteger2();
        bi._digits = digits;
        return bi;
    }
}

export = BigInteger2;