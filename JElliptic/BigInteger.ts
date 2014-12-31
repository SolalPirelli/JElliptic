﻿import BigInteger2 = require("BigInteger2");

class BigInteger {
    private static MAX_SAFE_INT = 9007199254740991; // 2^53-1, where 53 is the mantissa size of IEEE-754 double-precision floating point numbers (what JS uses)
    // Largest number that is:
    // - even (for halve())
    // - smaller than sqrt(MAX_SAFE_INT) (to multiply digits in the safe space)
    private static BASE = 94906264;

    private _isPositive: boolean;
    private _digits: number[]; // base BASE


    static MINUS_ONE = BigInteger.uncheckedCreate(false, [1]);
    static ZERO = BigInteger.uncheckedCreate(true, [0]);
    static ONE = BigInteger.uncheckedCreate(true, [1]);
    static TWO = BigInteger.uncheckedCreate(true, [2]);


    /** O(1) */
    static fromInt(n: number): BigInteger {
        if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
            throw "BigInteger.fromInt cannot be called with inexact integers.";
        }

        var isPositive = n >= 0;
        var digits = Array<number>();

        n = Math.abs(n);

        do {
            var rem = n % BigInteger.BASE;
            n = Math.floor(n / BigInteger.BASE);

            digits.push(rem);
        } while (n != 0);

        return BigInteger.create(isPositive, digits);
    }

    /** O(str.length) */
    static parse(str: string): BigInteger {
        // This is a bit too complex for bases that are powers of ten, but it works with any base
        var isPositive = true;
        if (str[0] == "-") {
            isPositive = false;
            str = str.substring(1);
        }

        var num = BigInteger2.parse(str);
        var base = BigInteger.fromInt(BigInteger2.BASE);
        var result = BigInteger.ZERO;
        var multiplier = BigInteger.ONE;
        for (var n = 0; n < num._digits.length; n++) {
            result = result.add(multiplier.singleDigitMul(num._digits[n]));
            multiplier = multiplier.mul(base);
        }

        if (!isPositive) {
            result = result.negate();
        }
        return result;
    }

    get isPositive(): boolean {
        return this._isPositive;
    }

    /** O(1) */
    negate(): BigInteger {
        return BigInteger.create(!this._isPositive, this._digits);
    }

    /** O(1) */
    abs(): BigInteger {
        if (this._isPositive) {
            return this;
        }
        return BigInteger.uncheckedCreate(true, this._digits);
    }

    /** O(this.digits)
        Rounds down. */
    halve(): BigInteger {
        var digits = new Array<number>(this._digits.length);
        var hasRest = false;
        for (var n = this._digits.length - 1; n >= 0; n--) {
            digits[n] = this._digits[n];
            if (hasRest) {
                digits[n] += BigInteger.BASE;
            }
            digits[n] = Math.floor(digits[n] / 2);

            hasRest = this._digits[n] % 2 == 1;
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(max(this.digits, other.digits)) */
    add(other: BigInteger): BigInteger {
        if (this.compare(BigInteger.ZERO) == 0) {
            return other;
        }
        if (other.compare(BigInteger.ZERO) == 0) {
            return this;
        }

        if (this._isPositive != other._isPositive) {
            return this.sub(other.negate());
        }

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

            if (current >= BigInteger.BASE) {
                carry = 1;
                current -= BigInteger.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        for (; carry == 1 && n < hi.length; n++) {
            var current = hi[n] + carry;

            if (current >= BigInteger.BASE) {
                carry = 1;
                current -= BigInteger.BASE;
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

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(max(this.digits, other.digits)) */
    sub(other: BigInteger): BigInteger {
        if (this.compare(BigInteger.ZERO) == 0) {
            return other.negate();
        }
        if (other.compare(BigInteger.ZERO) == 0) {
            return this;
        }

        if (this._isPositive != other._isPositive) {
            return this.add(other.negate());
        }

        // Unlike add, sub is not symmetric, some more work is required
        var hi = this;
        var lo = other;
        // First, if they're both negative, reverse them as -a - -b = -a + b = b - a for a,b >0
        if (!this._isPositive) {
            hi = other.abs();
            lo = this.abs();
        }
        // Then, they need to be ordered
        var absCompResult = hi.compareAbs(lo);
        var resultIsPositive = true;
        if (absCompResult == 0) {
            return BigInteger.ZERO;
        } else if (absCompResult < 0) {
            resultIsPositive = false;
            var temp = hi;
            hi = lo;
            lo = temp;
        }

        var digits = Array<number>();
        var carry = 0;
        var n = 0;

        for (; n < lo._digits.length; n++) {
            var current = hi._digits[n] - lo._digits[n] - carry;

            if (current < 0) {
                carry = 1;
                current += BigInteger.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        for (; carry == 1 && n < hi._digits.length; n++) {
            var current = hi._digits[n] - carry;

            if (current < 0) {
                carry = 1;
                current += BigInteger.BASE;
            } else {
                carry = 0;
            }

            digits[n] = current;
        }

        for (; n < hi._digits.length; n++) {
            digits[n] = hi._digits[n];
        }

        return BigInteger.create(resultIsPositive, digits);
    }

    /** O(max(this.digits, other.digits)^log_2(3)) */
    mul(other: BigInteger): BigInteger {
        var digits = Array<number>(this._digits.length + other._digits.length);
        // Initialize all digits, otherwise funky stuff happens with 'undefined'
        for (var n = 0; n < digits.length; n++) {
            digits[n] = 0;
        }

        for (var n = 0; n < this._digits.length; n++) {
            var carry = 0;
            for (var k = 0; k < other._digits.length; k++) {
                var sum = digits[n + k] + this._digits[n] * other._digits[k] + carry;
                carry = Math.floor(sum / BigInteger.BASE);
                sum = sum - BigInteger.BASE * carry;
                digits[n + k] = sum;
            }
            if (carry != 0) {
                // We can safely use = and no + here, as this cell hasn't been set yet
                digits[n + other._digits.length] = carry;
            }
        }

        return BigInteger.create(this._isPositive == other._isPositive, digits);
    }

    /** O(???) */
    divRem(other: BigInteger): BigInteger[] {
        var isPositive = this._isPositive == other._isPositive;
        var divisor = other.abs();
        var dividend = this.abs();

        switch (dividend.compare(divisor)) {
            case 0:
                if (isPositive) {
                    return [BigInteger.ONE, BigInteger.ZERO];
                } else {
                    return [BigInteger.MINUS_ONE, BigInteger.ZERO];
                }

            case -1:
                if (isPositive) {
                    return [BigInteger.ZERO, dividend];
                } else {
                    return [BigInteger.ZERO, divisor.sub(dividend)];
                }
        }

        var digits = new Array<number>();
        var remainder = BigInteger.ZERO;
        for (var n = dividend._digits.length - 1; n >= 0; n--) {
            remainder = remainder.pushRight(dividend._digits[n]);
            if (remainder.compare(divisor) == -1) {
                digits.push(0);
            } else {
                // Since remainder just became bigger than divisor,
                // its length is either divisor's or one more

                var highRemainder: number, highDivisor: number;
                if (remainder._digits.length > 2) {
                    highRemainder = remainder._digits[remainder._digits.length - 1] * BigInteger.BASE + remainder._digits[remainder._digits.length - 2];
                    if (remainder._digits.length > divisor._digits.length) {
                        highRemainder *= BigInteger.BASE;
                        highRemainder += remainder._digits[remainder._digits.length - 3];
                    }
                    highDivisor = divisor._digits[divisor._digits.length - 1] * BigInteger.BASE + divisor._digits[divisor._digits.length - 2];
                } else {
                    highRemainder = remainder._digits[remainder._digits.length - 1];
                    if (remainder._digits.length > divisor._digits.length) {
                        highRemainder *= BigInteger.BASE;
                        highRemainder += remainder._digits[remainder._digits.length - 2];
                    }
                    highDivisor = divisor._digits[divisor._digits.length - 1];
                }

                var guess = Math.ceil(highRemainder / highDivisor);

                var actual: BigInteger;
                while (guess > 0) {
                    actual = divisor.singleDigitMul(guess);
                    if (actual.compareAbs(remainder) < 1) {
                        break;
                    }
                    guess--;
                }

                remainder = remainder.sub(actual);
                digits.push(guess);
            }
        }

        if (!this._isPositive) {
            remainder = divisor.sub(remainder);
        }

        return [BigInteger.create(isPositive, digits.reverse()), remainder];
    }

    /** O(1) */
    partition(divisor: number): number {
        return this._digits[0] % divisor;
    }

    /** O(log(n)^2) */
    modInverse(n: BigInteger): BigInteger {
        var t = BigInteger.ZERO, newt = BigInteger.ONE;
        var r = n, newr = this;
        while (newr.compare(BigInteger.ZERO) != 0) {
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
        if (!t._isPositive) {
            t = t.add(n);
        }
        return t;
    }

    /** O(min(this.digits, other.digits)) */
    compare(other: BigInteger): number {
        if (this._isPositive && !other._isPositive) {
            return 1;
        }
        if (!this._isPositive && other._isPositive) {
            return -1;
        }
        if (this._digits.length < other._digits.length) {
            return this._isPositive ? -1 : 1;
        }
        if (this._digits.length > other._digits.length) {
            return this._isPositive ? 1 : -1;
        }
        for (var n = this._digits.length - 1; n >= 0; n--) {
            if (this._digits[n] < other._digits[n]) {
                return this._isPositive ? -1 : 1;
            }
            if (this._digits[n] > other._digits[n]) {
                return this._isPositive ? 1 : -1;
            }
        }
        return 0;
    }

    /** O(min(this.digits, other.digits)) */
    compareAbs(other: BigInteger): number {
        if (this._digits.length < other._digits.length) {
            return -1;
        }
        if (this._digits.length > other._digits.length) {
            return 1;
        }
        for (var n = this._digits.length - 1; n >= 0; n--) {
            if (this._digits[n] < other._digits[n]) {
                return -1;
            }
            if (this._digits[n] > other._digits[n]) {
                return 1;
            }
        }
        return 0;
    }

    /** O(min(this.digits, other.digits)) */
    and(other: BigInteger): BigInteger {
        var digits = Array<number>();

        for (var n = 0; n < this._digits.length && n < other._digits.length; n++) {
            digits.push(this._digits[n] & other._digits[n]);
        }

        return BigInteger.create(true, digits);
    }

    /** O(this.digits) */
    toInt(): number {
        // Hack-y, but simple
        var str = this.toString();
        var n = parseInt(str);
        if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
            throw "toInt can only work with small BigIntegers.";
        }

        return n;
    }

    /** O(this.digits) */
    toString(): string {
        var result = BigInteger2.ZERO;
        var base = BigInteger2.fromInt(BigInteger.BASE);
        var multiplier = BigInteger2.ONE;
        for (var n = 0; n < this._digits.length; n++) {
            var digit = BigInteger2.fromInt(this._digits[n]);
            result = result.add(digit.mul(multiplier));
            multiplier = multiplier.mul(base);
        }
        var str = result.toString();
        if (!this._isPositive) {
            str = "-" + str;
        }
        return str;
    }

    /** O(this.digits + n) */
    private leftShift(n: number): BigInteger {
        var digits = new Array(this._digits.length + n);

        for (var i = 0; i < n; i++) {
            digits[i] = 0;
        }

        for (var i = 0; i < this._digits.length; i++) {
            digits[i + n] = this._digits[i];
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(this.digits + n) */
    private pushRight(n: number): BigInteger {
        var digits = new Array(this._digits.length + 1);

        digits[0] = n;
        for (var i = 0; i < this._digits.length; i++) {
            digits[i + 1] = this._digits[i];
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(this.digits + n) */
    private rightShiftAbs(n: number): BigInteger {
        var digits = new Array(this._digits.length - n);

        for (var i = 0; i < digits.length; i++) {
            digits[i] = this._digits[i + n];
        }

        return BigInteger.create(true, digits);
    }

    /** O(digits). Assumes that mul is positive. */
    private singleDigitMul(mul: number): BigInteger {
        var digits = Array<number>(this._digits.length + 1);
        var carry = 0;
        var n = 0;
        for (; n < this._digits.length; n++) {
            var sum = this._digits[n] * mul + carry;
            carry = Math.floor(sum / BigInteger.BASE);
            sum = sum - BigInteger.BASE * carry;
            digits[n] = sum;
        }
        if (carry != 0) {
            digits[n] = carry;
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(digits) */
    private static create(isPositive: boolean, digits: number[]): BigInteger {
        // Remove useless digits
        var actualLength = digits.length;
        // Boolean NOT on a number also takes care of undefined
        while (actualLength > 0 && !digits[actualLength - 1]) {
            actualLength--;
        }

        if (actualLength == 0) {
            return BigInteger.ZERO;
        }

        var bi = new BigInteger();
        bi._isPositive = isPositive;
        bi._digits = digits.slice(0, actualLength);
        return bi;
    }

    /** O(1) */
    private static uncheckedCreate(isPositive: boolean, digits: number[]): BigInteger {
        var bi = new BigInteger();
        bi._isPositive = isPositive;
        bi._digits = digits;
        return bi;
    }
}

export = BigInteger;