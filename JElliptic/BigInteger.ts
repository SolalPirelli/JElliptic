class BigInteger {
    private static MAX_SAFE_INT = 9007199254740991; // 2^53-1, where 53 is the mantissa size of IEEE-754 double-precision floating point numbers (what JS uses)
    private static BASE = 10000000; // largest power of 10 smaller than sqrt(MAX_SAFE_INT) so that two digits can be multiplied in the safe space
    private static BASE_LOG10 = Math.floor(Math.log(BigInteger.BASE) / Math.log(10));


    private sign: number; // -1 or 1; zero always has 1 as a sign
    private digits: number[]; // base BASE


    static Zero = BigInteger.uncheckedCreate(1, [0]);
    static One = BigInteger.uncheckedCreate(1, [1]);


    static fromInt(n: number): BigInteger {
        if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
            throw "BigInteger.fromInt cannot be called with inexact integers.";
        }

        var sign = n >= 0 ? 1 : -1;
        var digits = Array<number>();

        n = Math.abs(n);

        do {
            var rem = n % BigInteger.BASE;
            n = Math.floor(n / BigInteger.BASE);

            digits.push(rem);
        } while (n != 0);

        return BigInteger.create(sign, digits);
    }

    // This is a bit too complex for bases that are powers of ten, but it works with any base
    static parse(str: string): BigInteger {
        var sign = 1;
        if (str[0] == "-") {
            sign = -1;
            str = str.substring(1);
        }

        var digits = Array<number>();
        var currentDigit = 0;
        var currentMul = 1;

        for (var n = str.length - 1; n >= 0; n--) {
            currentDigit += parseInt(str[n], 10) * currentMul;
            currentMul *= 10;

            if (currentMul >= BigInteger.BASE) {
                var nextDigit = Math.floor(currentDigit / BigInteger.BASE);
                currentDigit %= BigInteger.BASE;

                digits.push(currentDigit);

                currentDigit = nextDigit;
                currentMul = 1;
            }
        }

        if (currentDigit != 0) {
            digits.push(currentDigit % BigInteger.BASE);
            digits.push(Math.floor(currentDigit / BigInteger.BASE));
        }

        return BigInteger.create(sign, digits);
    }


    negate(): BigInteger {
        return BigInteger.create(-this.sign, this.digits.slice(0));
    }

    abs(): BigInteger {
        if (this.sign == 1) {
            return this;
        }
        return BigInteger.create(1, this.digits.slice(0));
    }

    clone(): BigInteger {
        return BigInteger.create(this.sign, this.digits.slice(0));
    }


    add(other: BigInteger): BigInteger {
        var thisAbs = this.abs();
        var otherAbs = other.abs();
        var thisIsGreater = thisAbs.gt(otherAbs) || thisAbs.eq(otherAbs) && this.sign == 1;
        var hi = thisIsGreater ? this : other;
        var lo = thisIsGreater ? other : this;

        var digits = Array<number>();
        var loSign = hi.sign == lo.sign ? 1 : -1;

        var carry: number = 0;

        for (var n = 0; n < hi.digits.length; n++) {
            var current = hi.digits[n] + loSign * (lo.digits[n] || 0) + carry;

            if (current >= BigInteger.BASE) {
                carry = 1;
                current -= BigInteger.BASE;
            } else if (current < 0) {
                carry = -1;
                current += BigInteger.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        if (carry != 0) {
            digits[hi.digits.length] = carry;
        }

        return BigInteger.create(hi.sign, digits);
    }

    sub(other: BigInteger): BigInteger {
        return this.add(other.negate());
    }

    // http://en.wikipedia.org/wiki/Karatsuba_algorithm
    mul(other: BigInteger): BigInteger {
        function singleDigitMul(bi: BigInteger, mul: number, mulSign: number): BigInteger {
            var digits = Array<number>();
            var carry = 0;
            for (var n = 0; n < bi.digits.length; n++) {
                var digit = bi.digits[n] * mul + carry;
                carry = Math.floor(digit / BigInteger.BASE);
                digit %= BigInteger.BASE;
                digits.push(digit);
            }
            if (carry != 0) {
                digits.push(carry);
            }

            return BigInteger.create(mulSign * bi.sign, digits);
        }

        if (this.digits.length == 1) {
            return singleDigitMul(other, this.digits[0], this.sign);
        }

        if (other.digits.length == 1) {
            return singleDigitMul(this, other.digits[0], other.sign);
        }

        var m = Math.max(this.digits.length, other.digits.length);
        var m2 = Math.ceil(m / 2);

        var lo1 = BigInteger.create(this.sign, this.digits.slice(0, m2));
        var hi1 = BigInteger.create(this.sign, this.digits.slice(m2));
        var lo2 = BigInteger.create(other.sign, other.digits.slice(0, m2));
        var hi2 = BigInteger.create(other.sign, other.digits.slice(m2));

        var z0 = lo1.mul(lo2);
        var z1 = lo1.add(hi1).mul(lo2.add(hi2));
        var z2 = hi1.mul(hi2);

        //return (z2.leftShift(m2 * 2)).add(z1.sub(z2).sub(z0).leftShift(m2)).add(z0);
        var aaa0 = (z2.leftShift(m2 * 2));
        var aaaaaa0 = z1.sub(z2).sub(z0);
        var aaaaaa1 = aaaaaa0.leftShift(m2);
        var aaa1 = aaa0.add(aaaaaa1);
        var aaa2 = aaa1.add(z0);
        return aaa2;
    }

    // Simple long division, sufficient for now
    div(other: BigInteger): BigInteger {
        var quotient = this;
        var result = BigInteger.Zero;

        while (quotient.gte(other)) {
            quotient = quotient.sub(other);
            result = result.add(BigInteger.One);
        }

        return result;
    }

    mod(n: BigInteger): BigInteger {
        var result = this;

        if (this.sign == 1) {
            while (result.gte(n)) {
                result = result.sub(n);
            }
        } else {
            while (BigInteger.Zero.gte(result)) {
                result = result.add(n);
            }
        }

        return result;
    }

    modInverse(n: BigInteger): BigInteger {
        var t = BigInteger.Zero, newt = BigInteger.One;
        var r = n, newr = this;
        while (!newr.eq(BigInteger.Zero)) {
            var quotient = r.div(newr);

            var oldt = t;
            t = newt;
            newt = oldt.sub(quotient.mul(newt));

            var oldr = r;
            r = newr;
            newr = oldr.sub(quotient.mul(newr));
        }
        if (r.gt(BigInteger.One)) {
            throw (this + " is not invertible");
        }
        if (t.sign == -1) {
            t = t.add(n);
        }
        return t;
    }

    lte(other: BigInteger): boolean {
        if (this.sign < other.sign) {
            return true;
        }
        if (this.sign > other.sign) {
            return false;
        }
        if (this.digits.length < other.digits.length) {
            return this.sign == 1;
        }
        if (this.digits.length > other.digits.length) {
            return this.sign == -1;
        }
        for (var n = this.digits.length - 1; n >= 0; n--) {
            if (this.digits[n] < other.digits[n]) {
                return this.sign == 1;
            }
            if (this.digits[n] > other.digits[n]) {
                return this.sign == -1;
            }
        }
        return true;
    }

    lt(other: BigInteger): boolean {
        return !this.gte(other);
    }

    gte(other: BigInteger): boolean {
        if (this.sign > other.sign) {
            return true;
        }
        if (this.sign < other.sign) {
            return false;
        }
        if (this.digits.length > other.digits.length) {
            return this.sign == 1;
        }
        if (this.digits.length < other.digits.length) {
            return this.sign == -1;
        }
        for (var n = this.digits.length - 1; n >= 0; n--) {
            if (this.digits[n] > other.digits[n]) {
                return this.sign == 1;
            }
            if (this.digits[n] < other.digits[n]) {
                return this.sign == -1;
            }
        }
        return true;
    }

    gt(other: BigInteger): boolean {
        return !this.lte(other);
    }

    leftShift(n: number): BigInteger {
        var digits = this.digits.slice(0);
        for (var _ = 0; _ < n; _++) {
            digits.unshift(0);
        }
        return BigInteger.create(this.sign, digits);
    }

    and(other: BigInteger): BigInteger {
        var digits: number[] = [];

        for (var n = 0; n < this.digits.length || n < other.digits.length; n++) {
            digits.push((this.digits[n] || 0) & (other.digits[n] || 0));
        }

        return BigInteger.create(1, digits);
    }


    eq(other: BigInteger) {
        var arrayEquals = (a: number[], b: number[]): boolean => {
            if (a == b) {
                return true;
            }
            if (a.length != b.length) {
                return false;
            }

            for (var i = 0; i < a.length; ++i) {
                if (a[i] != b[i]) {
                    return false;
                }
            }
            return true;
        }

        return this.sign == other.sign && arrayEquals(this.digits, other.digits);
    }


    toInt(): number {
        // Hack-y, but simple
        var str = this.toString();
        var n = parseInt(str);
        if (n > BigInteger.MAX_SAFE_INT) {
            throw "toInt can only work with small BigIntegers.";
        }

        return n;
    }

    toString(): string {
        var padNum = (n: number, len: number): string => {
            var str = n.toString();
            while (str.length < len) {
                str = '0' + str;
            }
            return str;
        }

        var result = "";

        for (var n = 0; n < this.digits.length - 1; n++) {
            result = padNum(this.digits[n], BigInteger.BASE_LOG10) + result;
        }
        result = this.digits[this.digits.length - 1].toString() + result;

        if (this.sign == -1) {
            result = "-" + result;
        }

        return result;
    }


    private static create(sign: number, digits: number[]): BigInteger {
        // Remove useless digits
        var actualLength = digits.length;
        while (actualLength > 0 && digits[actualLength - 1] == 0) {
            actualLength--;
        }

        if (actualLength == 0) {
            return BigInteger.Zero;
        }

        var bi = new BigInteger();
        bi.sign = sign;
        bi.digits = digits.slice(0, actualLength);
        return bi;
    }

    private static uncheckedCreate(sign: number, digits: number[]): BigInteger {
        var bi = new BigInteger();
        bi.sign = sign;
        bi.digits = digits;
        return bi;
    }
}

export = BigInteger;