class BigInteger {
    private static BASE = 10000; // largest power of 10 smaller than sqrt(uint32 max) so that two digits can be multiplied in the safe space; also needs to be even
    private static BASE_LOG10 = Math.floor(Math.log(BigInteger.BASE) / Math.log(10));


    private _positive: boolean;
    private _digits: Uint32Array; // base BASE


    static MINUS_ONE = BigInteger.uncheckedCreate(false, [1]);
    static ZERO = BigInteger.uncheckedCreate(true, [0]);
    static ONE = BigInteger.uncheckedCreate(true, [1]);
    static TWO = BigInteger.uncheckedCreate(true, [2]);


    /** O(1) */
    static fromInt(n: number): BigInteger {
        var positive = n >= 0;
        n = Math.abs(n);

        var digits = new Uint32Array(Math.ceil(Math.log(n) / Math.log(BigInteger.BASE) + 1));

        var index = 0;
        do {
            var rem = n % BigInteger.BASE;
            n = Math.floor(n / BigInteger.BASE);

            digits[index] = rem;
            index++;
        } while (n != 0);

        return BigInteger.create(positive, digits);
    }

    /** O(str.length) */
    static parse(str: string): BigInteger {
        // This is a bit too complex for bases that are powers of ten, but it works with any base
        var positive = true;
        if (str[0] == "-") {
            positive = false;
            str = str.substring(1);
        }

        // TODO: Is there a way to use Uint32Array here? We'd need an upper bound on the length...
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

        return BigInteger.create(positive, new Uint32Array(digits));
    }

    /** O(1) */
    negate(): BigInteger {
        return BigInteger.create(!this._positive, this._digits);
    }

    /** O(1) */
    abs(): BigInteger {
        if (this._positive) {
            return this;
        }
        return BigInteger.create(true, this._digits);
    }

    /** O(this.digits)
        Rounds down. */
    halve(): BigInteger {
        var digits = new Uint32Array(this._digits.length);
        var hasRest = false;
        for (var n = this._digits.length - 1; n >= 0; n--) {
            digits[n] = Math.floor(this._digits[n] / 2);
            if (hasRest) {
                digits[n] += BigInteger.BASE / 2;
            }
            hasRest = this._digits[n] % 2 == 1;
        }

        return BigInteger.create(this._positive, digits);
    }

    /** O(max(this.digits, other.digits)) */
    add(other: BigInteger): BigInteger {
        var thisAbs = this.abs();
        var otherAbs = other.abs();
        var thisIsGreater = thisAbs.compare(otherAbs) == 1 || thisAbs.eq(otherAbs) && this._positive;
        var hi = thisIsGreater ? this : other;
        var lo = thisIsGreater ? other : this;

        var digits = new Uint32Array(hi._digits.length);
        var loIsPositive = hi._positive == lo._positive;

        var carry: number = 0;

        for (var n = 0; n < hi._digits.length; n++) {
            var current = hi._digits[n] + carry;
            if (n < lo._digits.length) {
                if (loIsPositive) {
                    current += lo._digits[n];
                } else {
                    current -= lo._digits[n];
                }
            }

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
            digits[hi._digits.length] = carry;
        }

        return BigInteger.create(hi._positive, digits);
    }

    /** O(max(this.digits, other.digits)) */
    sub(other: BigInteger): BigInteger {
        return this.add(other.negate());
    }

    /** O(max(this.digits, other.digits)^log_2(3)) */
    mul(other: BigInteger): BigInteger {
        function singleDigitMul(bi: BigInteger, mul: number, resultIsPositive: boolean): BigInteger {
            var digits = new Uint32Array(bi._digits.length + 1);
            var carry = 0;
            for (var n = 0; n < bi._digits.length; n++) {
                var digit = bi._digits[n] * mul + carry;
                carry = Math.floor(digit / BigInteger.BASE);
                digit %= BigInteger.BASE;
                digits[n] = digit;
            }
            if (carry != 0) {
                digits[bi._digits.length] = carry;
            }

            return BigInteger.create(resultIsPositive == bi._positive, digits);
        }

        if (this._digits.length == 1) {
            return singleDigitMul(other, this._digits[0], this._positive);
        }

        if (other._digits.length == 1) {
            return singleDigitMul(this, other._digits[0], other._positive);
        }

        // http://en.wikipedia.org/wiki/Karatsuba_algorithm

        var m = Math.max(this._digits.length, other._digits.length);
        var m2 = Math.ceil(m / 2);

        var lo1 = BigInteger.create(this._positive, this._digits.subarray(0, m2));
        var hi1 = BigInteger.create(this._positive, this._digits.subarray(m2));
        var lo2 = BigInteger.create(other._positive, other._digits.subarray(0, m2));
        var hi2 = BigInteger.create(other._positive, other._digits.subarray(m2));

        var z0 = lo1.mul(lo2);
        var z1 = lo1.add(hi1).mul(lo2.add(hi2));
        var z2 = hi1.mul(hi2);

        return (z2.leftShift(m2 * 2)).add(z1.sub(z2).sub(z0).leftShift(m2)).add(z0);
    }

    /** O(???) */
    divRem(other: BigInteger): BigInteger[] {
        function inner(dividend: BigInteger, divisor: BigInteger): BigInteger[] {
            if (dividend.eq(BigInteger.ZERO)) {
                return [BigInteger.ZERO, BigInteger.ZERO]; // yes, even if divisor == 0
            }

            var low = BigInteger.ONE;
            var high = BigInteger.TWO;
            var fastGrowth = true;

            while (low.compare(high) == -1) {
                var guess = low.add(high).halve();
                var remainder = dividend.sub(divisor.mul(guess));
                if (remainder.compare(divisor) > -1) {
                    if (fastGrowth) {
                        low = guess.add(BigInteger.ONE);
                        high = high.mul(high);
                    } else {
                        low = guess.add(BigInteger.ONE);
                    }
                } else {
                    high = guess;
                    fastGrowth = false;
                }
            }

            return [low, dividend.sub(divisor.mul(low))];
        }

        var resultIsPositive = this._positive == other._positive;
        var divisor = other.abs();
        var dividend = this.abs();

        switch (dividend.compare(divisor)) {
            case 0:
                if (resultIsPositive) {
                    return [BigInteger.ONE, BigInteger.ZERO];
                } else {
                    return [BigInteger.MINUS_ONE, BigInteger.ZERO];
                }

            case -1:
                if (resultIsPositive) {
                    return [BigInteger.ZERO, dividend];
                } else {
                    return [BigInteger.ZERO, divisor.sub(dividend)];
                }
        }

        var digits = new Uint32Array(this._digits.length);

        // First, take digits from the biggest one until the number they form is bigger than the divisor
        var index: number;
        var remainder: BigInteger;
        for (index = dividend._digits.length - divisor._digits.length; index >= 0; index--) {
            var shifted = dividend.rightShiftAbs(index);
            if (shifted.compare(divisor) > -1) {
                // Divide that number by the divisor, store the quotient, and keep the remainder
                var quotientAndRemainder = inner(shifted, divisor);
                remainder = quotientAndRemainder[1];
                digits[index] = quotientAndRemainder[0].toInt();
                index--;
                break;
            }
        }

        // Then, for each digit from the next, add it as the new smallest one and repeat
        for (; index >= 0; index--) {
            var newDigit = dividend._digits[index];
            var newDividend = remainder.pushRight(newDigit);
            var quotientAndRemainder = inner(newDividend, divisor);
            remainder = quotientAndRemainder[1];
            digits[index] = quotientAndRemainder[0].toInt();
        }

        if (!this._positive) {
            remainder = divisor.sub(remainder);
        }

        return [BigInteger.create(resultIsPositive, digits), remainder];
    }

    /** ~O(1) */
    smallRem(divisor: number): number {
        return this._digits[0] % divisor;
    }

    /** O(log(n)^2) */
    modInverse(n: BigInteger): BigInteger {
        var t = BigInteger.ZERO, newt = BigInteger.ONE;
        var r = n, newr = this;
        while (!newr.eq(BigInteger.ZERO)) {
            var quotient = r.divRem(newr)[0];

            var oldt = t;
            t = newt;
            newt = oldt.sub(quotient.mul(newt));

            var oldr = r;
            r = newr;
            newr = oldr.sub(quotient.mul(newr));
        }
        if (r.compare(BigInteger.ONE) == 1) {
            throw (this + " is not invertible");
        }
        if (!t._positive) {
            t = t.add(n);
        }
        return t;
    }

    /** O(min(this.digits, other.digits)) */
    compare(other: BigInteger): number {
        if (this._positive && !other._positive) {
            return 1;
        }
        if (!this._positive && other._positive) {
            return -1;
        }
        if (this._digits.length < other._digits.length) {
            return this._positive ? -1 : 1;
        }
        if (this._digits.length > other._digits.length) {
            return this._positive ? 1 : -1;
        }
        for (var n = this._digits.length - 1; n >= 0; n--) {
            if (this._digits[n] < other._digits[n]) {
                return this._positive ? -1 : 1;
            }
            if (this._digits[n] > other._digits[n]) {
                return this._positive ? 1 : -1;
            }
        }
        return 0;
    }

    /** O(min(this.digits, other.digits)) */
    and(other: BigInteger): BigInteger {
        var digits = new Uint32Array(Math.min(this._digits.length, other._digits.length));

        for (var n = 0; n < this._digits.length && n < other._digits.length; n++) {
            digits[n] = this._digits[n] & other._digits[n];
        }

        return BigInteger.create(true, digits);
    }

    /** O(min(this.digits, other.digits)) */
    eq(other: BigInteger) {
        function arrayEquals(a: Uint32Array, b: Uint32Array): boolean {
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

        return this._positive == other._positive && arrayEquals(this._digits, other._digits);
    }

    /** O(this.digits) */
    toInt(): number {
        // Hack-y, but simple
        return parseInt(this.toString());
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
            result = padNum(this._digits[n], BigInteger.BASE_LOG10) + result;
        }
        result = this._digits[this._digits.length - 1].toString() + result;

        if (!this._positive) {
            result = "-" + result;
        }

        return result;
    }

    /** O(this.digits + n) */
    private leftShift(n: number): BigInteger {
        var digits = new Uint32Array(this._digits.length + n);

        for (var i = 0; i < n; i++) {
            digits[i] = 0;
        }

        for (var i = 0; i < this._digits.length; i++) {
            digits[i + n] = this._digits[i];
        }

        return BigInteger.create(this._positive, digits);
    }

    /** O(this.digits + n) */
    private pushRight(n: number): BigInteger {
        var digits = new Uint32Array(this._digits.length + 1);

        digits[0] = n;
        for (var i = 0; i < this._digits.length; i++) {
            digits[i + 1] = this._digits[i];
        }

        return BigInteger.create(this._positive, digits);
    }

    /** O(this.digits + n) */
    private rightShiftAbs(n: number): BigInteger {
        var digits = new Uint32Array(this._digits.length - n);

        for (var i = 0; i < digits.length; i++) {
            digits[i] = this._digits[i + n];
        }

        return BigInteger.create(true, digits);
    }

    /** O(digits) */
    private static create(positive: boolean, digits: Uint32Array): BigInteger {
        // Remove useless digits
        var actualLength = digits.length;
        while (actualLength > 0 && digits[actualLength - 1] == 0) {
            actualLength--;
        }

        if (actualLength == 0) {
            return BigInteger.ZERO;
        }

        var bi = new BigInteger();
        bi._positive = positive;
        bi._digits = digits.subarray(0, actualLength);
        return bi;
    }

    /** O(1) */
    private static uncheckedCreate(positive: boolean, digits: number[]): BigInteger {
        var bi = new BigInteger();
        bi._positive = positive;
        bi._digits = new Uint32Array(digits);
        return bi;
    }
}

export = BigInteger;