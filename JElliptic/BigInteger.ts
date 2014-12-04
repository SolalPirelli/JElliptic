// Performance notes:
// 
// * n | 0 is equivalent to floor(n), but it's much faster on IE; however, it can only be used if -2^31 <= n < 2^31.
// * Karatsuba multiplication isn't worth it for the integer sizes we're dealing with


class BigInteger {
    private static MAX_SAFE_INT = 9007199254740991; // 2^53-1, where 53 is the mantissa size of IEEE-754 double-precision floating point numbers (what JS uses)

    private _isPositive: boolean;
    private _digits: boolean[];


    static MINUS_ONE = BigInteger.uncheckedCreate(false, [true]);
    static ZERO = BigInteger.uncheckedCreate(true, [false]);
    static ONE = BigInteger.uncheckedCreate(true, [true]);
    static TWO = BigInteger.uncheckedCreate(true, [false, true]);


    /** O(1) */
    static fromInt(n: number): BigInteger {
        if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
            throw "BigInteger.fromInt cannot be called with inexact integers.";
        }

        var isPositive = n >= 0;
        var digits = Array<boolean>();

        n = Math.abs(n);

        do {
            var rem = n % 2 == 1;
            n = Math.floor(n / 2);
            digits.push(rem);
        } while (n != 0);

        return BigInteger.create(isPositive, digits);
    }

    /** O(str.length) */
    static parse(str: string): BigInteger {
        function isOdd(s: string): boolean {
            var lastChar = s[s.length - 1];
            return lastChar == "1"
                || lastChar == "3"
                || lastChar == "5"
                || lastChar == "7"
                || lastChar == "9";
        }
        function halve(s: string): string {
            var result = "";
            var hasRemainder = false;
            for (var n = 0; n < s.length; n++) {
                var asNum = parseInt(s[n]);
                if (hasRemainder) {
                    asNum += 10;
                }
                hasRemainder = asNum % 2 == 1;
                asNum = (asNum / 2) | 0;

                if (asNum != 0 || result != "") {
                    result = result + asNum;
                }
            }

            if (result == "") {
                result = "0";
            }

            return result;
        }

        if (str == "0") {
            return BigInteger.ZERO;
        }

        var isPositive = true;
        if (str[0] == "-") {
            isPositive = false;
            str = str.substring(1);
        }

        var digits = Array<boolean>();
        while (str != "0") {
            digits.push(isOdd(str));
            str = halve(str);
        }

        return BigInteger.create(isPositive, digits);
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
        return BigInteger.create(true, this._digits);
    }

    /** O(this.digits)
        Rounds down. */
    halve(): BigInteger {
        return BigInteger.create(this._isPositive, this._digits.slice(1));
    }

    // Indices in order: hi, lo, carry, carryNeg
    // Result = 1 iff sum % 2 == 1
    // Carry = 1 iff sum == +3 | +2 | -1 | -2
    // CarryNeg = 1 iff sum == -1 | -2
    private static ADD_LOOKUP_RESULT: any = {
        true: {
            true: {
                true: {
                    true: true, // 1 + 1 - 1 = +1
                    false: true  // 1 + 1 + 1 = +3
                },
                false: {
                    true: false, // 1 + 1 + 0 = +2
                    false: false  // 1 + 1 - 0 = +2
                }
            },
            false: {
                true: {
                    true: false, // 1 + 0 - 1 = 0
                    false: false // 1 + 0 + 1 = +2
                },
                false: {
                    true: true, // 1 + 0 + 0 = +1
                    false: true // 1 + 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: false, // 0 + 1 - 1 = 0
                    false: false  // 0 + 1 + 1 = +2
                },
                false: {
                    true: true, // 0 + 1 + 0 = +1
                    false: true  // 0 + 1 - 0 = +1
                }
            },
            false: {
                true: {
                    true: true, // 0 + 0 - 1 = -1
                    false: true // 0 + 0 + 1 = +1
                },
                false: {
                    true: false, // 0 + 0 + 0 = 0
                    false: false // 0 + 0 - 0 = 0
                }
            }
        }
    };
    private static ADD_LOOKUP_RESULT_LONEG: any = {
        true: {
            true: {
                true: {
                    true: true, // 1 - 1 - 1 = -1
                    false: true  // 1 - 1 + 1 = +1
                },
                false: {
                    true: false, // 1 - 1 + 0 = 0
                    false: false  // 1 - 1 - 0 = 0
                }
            },
            false: {
                true: {
                    true: false, // 1 - 0 - 1 = 0
                    false: false // 1 - 0 + 1 = +2
                },
                false: {
                    true: true, // 1 - 0 + 0 = +1
                    false: true // 1 - 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: false, // 0 - 1 - 1 = -2
                    false: false  // 0 - 1 + 1 = 0
                },
                false: {
                    true: true, // 0 - 1 + 0 = -1
                    false: true  // 0 - 1 - 0 = -1
                }
            },
            false: {
                true: {
                    true: true, // 0 - 0 - 1 = -1
                    false: true // 0 - 0 + 1 = +1
                },
                false: {
                    true: false, // 0 - 0 + 0 = 0
                    false: false // 0 - 0 - 0 = 0
                }
            }
        }
    }
    private static ADD_LOOKUP_CARRY: any = {
        true: {
            true: {
                true: {
                    true: false, // 1 + 1 - 1 = +1
                    false: true  // 1 + 1 + 1 = +3
                },
                false: {
                    true: true, // 1 + 1 + 0 = +2
                    false: true  // 1 + 1 - 0 = +2
                }
            },
            false: {
                true: {
                    true: false, // 1 + 0 - 1 = 0
                    false: true // 1 + 0 + 1 = +2
                },
                false: {
                    true: false, // 1 + 0 + 0 = +1
                    false: false // 1 + 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: false, // 0 + 1 - 1 = 0
                    false: true  // 0 + 1 + 1 = +2
                },
                false: {
                    true: false, // 0 + 1 + 0 = +1
                    false: false  // 0 + 1 - 0 = +1
                }
            },
            false: {
                true: {
                    true: true, // 0 + 0 - 1 = -1
                    false: false // 0 + 0 + 1 = +1
                },
                false: {
                    true: false, // 0 + 0 + 0 = 0
                    false: false // 0 + 0 - 0 = 0
                }
            }
        }
    };
    private static ADD_LOOKUP_CARRY_LONEG: any = {
        true: {
            true: {
                true: {
                    true: true, // 1 - 1 - 1 = -1
                    false: false  // 1 - 1 + 1 = +1
                },
                false: {
                    true: false, // 1 - 1 + 0 = 0
                    false: false  // 1 - 1 - 0 = 0
                }
            },
            false: {
                true: {
                    true: false, // 1 - 0 - 1 = 0
                    false: true // 1 - 0 + 1 = +2
                },
                false: {
                    true: false, // 1 - 0 + 0 = +1
                    false: false // 1 - 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: true, // 0 - 1 - 1 = -2
                    false: false  // 0 - 1 + 1 = 0
                },
                false: {
                    true: true, // 0 - 1 + 0 = -1
                    false: true  // 0 - 1 - 0 = -1
                }
            },
            false: {
                true: {
                    true: true, // 0 - 0 - 1 = -1
                    false: false // 0 - 0 + 1 = +1
                },
                false: {
                    true: false, // 0 - 0 + 0 = 0
                    false: false // 0 - 0 - 0 = 0
                }
            }
        }
    }
    private static ADD_LOOKUP_CARRYNEG: any = {
        true: {
            true: {
                true: {
                    true: false, // 1 + 1 - 1 = +1
                    false: false  // 1 + 1 + 1 = +3
                },
                false: {
                    true: false, // 1 + 1 + 0 = +2
                    false: false  // 1 + 1 - 0 = +2
                }
            },
            false: {
                true: {
                    true: false, // 1 + 0 - 1 = 0
                    false: false // 1 + 0 + 1 = +2
                },
                false: {
                    true: false, // 1 + 0 + 0 = +1
                    false: false // 1 + 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: false, // 0 + 1 - 1 = 0
                    false: false  // 0 + 1 + 1 = +2
                },
                false: {
                    true: false, // 0 + 1 + 0 = +1
                    false: false  // 0 + 1 - 0 = +1
                }
            },
            false: {
                true: {
                    true: true, // 0 + 0 - 1 = -1
                    false: false // 0 + 0 + 1 = +1
                },
                false: {
                    true: false, // 0 + 0 + 0 = 0
                    false: false // 0 + 0 - 0 = 0
                }
            }
        }
    };
    private static ADD_LOOKUP_CARRYNEG_LONEG: any = {
        true: {
            true: {
                true: {
                    true: true, // 1 - 1 - 1 = -1
                    false: false  // 1 - 1 + 1 = +1
                },
                false: {
                    true: false, // 1 - 1 + 0 = 0
                    false: false  // 1 - 1 - 0 = 0
                }
            },
            false: {
                true: {
                    true: false, // 1 - 0 - 1 = 0
                    false: false // 1 - 0 + 1 = +2
                },
                false: {
                    true: false, // 1 - 0 + 0 = +1
                    false: false // 1 - 0 - 0 = +1
                }
            }
        },
        false: {
            true: {
                true: {
                    true: true, // 0 - 1 - 1 = -2
                    false: false  // 0 - 1 + 1 = 0
                },
                false: {
                    true: true, // 0 - 1 + 0 = -1
                    false: true  // 0 - 1 - 0 = -1
                }
            },
            false: {
                true: {
                    true: true, // 0 - 0 - 1 = -1
                    false: false // 0 - 0 + 1 = +1
                },
                false: {
                    true: false, // 0 - 0 + 0 = 0
                    false: false // 0 - 0 - 0 = 0
                }
            }
        }
    }

    // Indices in order: hi, carry, carryNeg
    // Result = 1 iff sum = +1 | -1
    // Carry = 1 iff sum = +2 | -1
    // CarryNeg = 1 iff sum = -1
    private static ADD_LOOKUP_RESULT_NOLO: any = {
        true: {
            true: {
                true: false, // 1 - 1 = 0
                false: false, // 1 + 1 = +2
            },
            false: {
                true: true, // 1 + 0 = +1
                false: true, // 1 - 0 = +1
            }
        },
        false: {
            true: {
                true: true, // 0 - 1 = -1
                false: true, // 0 + 1 = +1
            },
            false: {
                true: false, // 0 - 0 = 0
                false: false, // 0 + 0 = 0
            }
        }
    };
    private static ADD_LOOKUP_CARRY_NOLO: any = {
        true: {
            true: {
                true: false, // 1 - 1 = 0
                false: true, // 1 + 1 = +2
            },
            false: {
                true: false, // 1 + 0 = +1
                false: false, // 1 - 0 = +1
            }
        },
        false: {
            true: {
                true: true, // 0 - 1 = -1
                false: false, // 0 + 1 = +1
            },
            false: {
                true: false, // 0 - 0 = 0
                false: false, // 0 + 0 = 0
            }
        }
    };
    private static ADD_LOOKUP_CARRYNEG_NOLO: any = {
        true: {
            true: {
                true: false, // 1 - 1 = 0
                false: false, // 1 + 1 = +2
            },
            false: {
                true: false, // 1 + 0 = +1
                false: false, // 1 - 0 = +1
            }
        },
        false: {
            true: {
                true: true, // 0 - 1 = -1
                false: false, // 0 + 1 = +1
            },
            false: {
                true: false, // 0 - 0 = 0
                false: false, // 0 + 0 = 0
            }
        }
    };

    /** O(max(this.digits, other.digits)) */
    add(other: BigInteger): BigInteger {
        var thisAbs = this.abs();
        var otherAbs = other.abs();
        var thisComparedToOther = thisAbs.compare(otherAbs);
        var thisIsGreater = thisComparedToOther == 1 || (thisComparedToOther == 0 && this._isPositive);
        var hi = thisIsGreater ? this : other;
        var lo = thisIsGreater ? other : this;

        var result = Array<boolean>(hi._digits.length + 1);
        var carry = false;
        var carryNeg = false;

        if (hi._isPositive == lo._isPositive) {
            for (var n = 0; n < lo._digits.length; n++) {
                result[n] = BigInteger.ADD_LOOKUP_RESULT[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                var newCarry = BigInteger.ADD_LOOKUP_CARRY[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                carryNeg = BigInteger.ADD_LOOKUP_CARRYNEG[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                carry = newCarry;
            }
        } else {
            for (var n = 0; n < lo._digits.length; n++) {
                result[n] = BigInteger.ADD_LOOKUP_RESULT_LONEG[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                var newCarry = BigInteger.ADD_LOOKUP_CARRY_LONEG[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                carryNeg = BigInteger.ADD_LOOKUP_CARRYNEG_LONEG[hi._digits[n]][lo._digits[n]][carry][carryNeg];
                carry = newCarry;
            }
        }

        for (var n = lo._digits.length; n < hi._digits.length; n++) {
            result[n] = BigInteger.ADD_LOOKUP_RESULT_NOLO[hi._digits[n]][carry][carryNeg];
            var newCarry = BigInteger.ADD_LOOKUP_CARRY_NOLO[hi._digits[n]][carry][carryNeg];
            carryNeg = BigInteger.ADD_LOOKUP_CARRYNEG_NOLO[hi._digits[n]][carry][carryNeg];
            carry = newCarry;
        }

        result[hi._digits.length] = carry;

        return BigInteger.create(hi._isPositive, result);
    }

    /** O(max(this.digits, other.digits)) */
    sub(other: BigInteger): BigInteger {
        return this.add(other.negate());
    }

    /** O(this.digits * add) */
    mul(other: BigInteger): BigInteger {
        var result = BigInteger.ZERO;
        for (var n = 0; n < other._digits.length; n++) {
            if (other._digits[n]) {
                result = result.add(this.leftShift(n));
            }
        }

        if (other._isPositive) {
            return result;
        }
        return result.negate();
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

        var digits = Array<boolean>(dividend._digits.length - divisor._digits.length + 1);

        var index: number;
        var remainder: BigInteger;
        for (index = dividend._digits.length - divisor._digits.length; index >= 0; index--) {
            var shifted = dividend.rightShiftAbs(index);
            if (shifted.compare(divisor) > -1) {
                remainder = shifted.sub(divisor);
                digits[index] = true;
                index--;
                break;
            } else {
                digits[index] = false;
            }
        }

        for (; index >= 0; index--) {
            var newDigit = dividend._digits[index];
            var newDividend = remainder.pushRight(newDigit);
            if (newDividend.compare(divisor) > -1) {
                remainder = newDividend.sub(divisor);
                digits[index] = true;
            } else {
                remainder = newDividend;
                digits[index] = false;
            }
        }

        if (!this._isPositive) {
            remainder = divisor.sub(remainder);
        }

        return [BigInteger.create(isPositive, digits), remainder];
    }

    /** O(digits) */
    partition(divisor: number): number {
        var result = 0;
        var max = Math.min(this._digits.length, Math.ceil(Math.log(divisor) / Math.LN2));
        for (var n = max; n >= 0; n--) {
            result *= 2;
            if (this._digits[n]) {
                result += 1;
            }
        }
        return result % divisor;
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
            if (!this._digits[n] && other._digits[n]) {
                return this._isPositive ? -1 : 1;
            }
            if (this._digits[n] && !other._digits[n]) {
                return this._isPositive ? 1 : -1;
            }
        }
        return 0;
    }

    /** O(min(this.digits, other.digits)) */
    and(other: BigInteger): BigInteger {
        var length = Math.min(this._digits.length, other._digits.length);
        var digits = Array<boolean>(length);

        for (var n = 0; n < length; n++) {
            digits[n] = this._digits[n] && other._digits[n];
        }

        return BigInteger.create(true, digits);
    }

    /** O(min(this.digits, other.digits)) */
    eq(other: BigInteger) {
        function arrayEquals(a: boolean[], b: boolean[]): boolean {
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

        return this._isPositive == other._isPositive && arrayEquals(this._digits, other._digits);
    }

    /** O(this.digits) */
    toInt(): number {
        // Hack-y, but simple
        var n = parseInt(this.toString());
        if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
            throw "toInt can only work with small BigIntegers.";
        }

        return n;
    }

    /** O(this.digits) */
    toString(): string {
        function addOp(str: string, op: (n: number, idx: number) => number): string {
            var result = "";
            var carry = false;
            for (var n = str.length - 1; n >= 0; n--) {
                var asNum = parseInt(str[n]);
                asNum = op(asNum, n);
                if (carry) {
                    asNum += 1;
                }
                if (asNum > 9) {
                    asNum -= 10;
                    carry = true;
                } else {
                    carry = false;
                }
                result = asNum + result;
            }
            if (carry) {
                result = "1" + result;
            }
            return result;
        }

        var result = "0";
        for (var n = this._digits.length - 1; n >= 0; n--) {
            result = addOp(result, (x, _) => x * 2);
            if (this._digits[n]) {
                result = addOp(result, (x, i) => x + (i == result.length - 1 ? 1 : 0));
            }
        }

        if (!this._isPositive) {
            result = "-" + result;
        }

        return result;
    }

    /** O(this.digits + n) */
    private leftShift(n: number): BigInteger {
        var digits = Array<boolean>(this._digits.length + n);

        for (var i = 0; i < n; i++) {
            digits[i] = false;
        }

        for (var i = 0; i < this._digits.length; i++) {
            digits[i + n] = this._digits[i];
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(this.digits) */
    private pushRight(b: boolean): BigInteger {
        var digits = Array<boolean>(this._digits.length + 1);

        digits[0] = b;
        for (var i = 0; i < this._digits.length; i++) {
            digits[i + 1] = this._digits[i];
        }

        return BigInteger.create(this._isPositive, digits);
    }

    /** O(this.digits + n) */
    private rightShiftAbs(n: number): BigInteger {
        var digits = Array<boolean>(this._digits.length - n);

        for (var i = 0; i < digits.length; i++) {
            digits[i] = this._digits[i + n];
        }

        return BigInteger.create(true, digits);
    }

    /** O(digits) */
    private static create(isPositive: boolean, digits: boolean[]): BigInteger {
        // Remove useless digits
        var actualLength = digits.length;
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
    private static uncheckedCreate(isPositive: boolean, digits: boolean[]): BigInteger {
        var bi = new BigInteger();
        bi._isPositive = isPositive;
        bi._digits = digits;
        return bi;
    }
}

export = BigInteger;