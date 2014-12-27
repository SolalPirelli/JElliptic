define(["require", "exports"], function(require, exports) {
    var BigInteger = (function () {
        function BigInteger() {
        }
        /** O(1) */
        BigInteger.fromInt = function (n) {
            if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
                throw "BigInteger.fromInt cannot be called with inexact integers.";
            }

            var isPositive = n >= 0;
            var digits = Array();

            n = Math.abs(n);

            do {
                var rem = n % BigInteger.BASE;
                n = Math.floor(n / BigInteger.BASE);

                digits.push(rem);
            } while(n != 0);

            return BigInteger.create(isPositive, digits);
        };

        /** O(str.length) */
        BigInteger.parse = function (str) {
            // This is a bit too complex for bases that are powers of ten, but it works with any base
            var isPositive = true;
            if (str[0] == "-") {
                isPositive = false;
                str = str.substring(1);
            }

            var digits = Array();
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

            return BigInteger.create(isPositive, digits);
        };

        Object.defineProperty(BigInteger.prototype, "isPositive", {
            get: function () {
                return this._isPositive;
            },
            enumerable: true,
            configurable: true
        });

        /** O(1) */
        BigInteger.prototype.negate = function () {
            return BigInteger.create(!this._isPositive, this._digits);
        };

        /** O(1) */
        BigInteger.prototype.abs = function () {
            if (this._isPositive) {
                return this;
            }
            return BigInteger.uncheckedCreate(true, this._digits);
        };

        /** O(this.digits)
        Rounds down. */
        BigInteger.prototype.halve = function () {
            var digits = new Array(this._digits.length);
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
        };

        /** O(max(this.digits, other.digits)) */
        BigInteger.prototype.add = function (other) {
            if (this.compare(BigInteger.ZERO) == 0) {
                return other;
            }
            if (other.compare(BigInteger.ZERO) == 0) {
                return this;
            }

            if (this._isPositive != other._isPositive) {
                return this.sub(other.negate());
            }

            var digits = Array();
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
            } else {
                digits[n] = 1;
            }

            return BigInteger.create(this._isPositive, digits);
        };

        /** O(max(this.digits, other.digits)) */
        BigInteger.prototype.sub = function (other) {
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

            var digits = Array();
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
        };

        /** O(max(this.digits, other.digits)^log_2(3)) */
        BigInteger.prototype.mul = function (other) {
            var digits = Array(this._digits.length + other._digits.length);

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
        };

        /** O(???) */
        BigInteger.prototype.divRem = function (other) {
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

            var digits = new Array();
            var remainder = BigInteger.ZERO;
            for (var n = dividend._digits.length - 1; n >= 0; n--) {
                remainder = remainder.pushRight(dividend._digits[n]);
                if (remainder.compare(divisor) == -1) {
                    digits.push(0);
                } else {
                    // Since remainder just became bigger than divisor,
                    // its length is either divisor's or one more
                    var highRemainder = remainder._digits[remainder._digits.length - 1];
                    if (remainder._digits.length > divisor._digits.length) {
                        highRemainder *= BigInteger.BASE;
                        highRemainder += remainder._digits[remainder._digits.length - 2];
                    }
                    var highDivisor = divisor._digits[divisor._digits.length - 1];

                    var guess = Math.ceil(highRemainder / highDivisor);

                    var actual;
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
        };

        /** O(1) */
        BigInteger.prototype.partition = function (divisor) {
            return this._digits[0] % divisor;
        };

        /** O(log(n)^2) */
        BigInteger.prototype.modInverse = function (n) {
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
        };

        /** O(min(this.digits, other.digits)) */
        BigInteger.prototype.compare = function (other) {
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
        };

        /** O(min(this.digits, other.digits)) */
        BigInteger.prototype.compareAbs = function (other) {
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
        };

        /** O(min(this.digits, other.digits)) */
        BigInteger.prototype.and = function (other) {
            var digits = Array();

            for (var n = 0; n < this._digits.length && n < other._digits.length; n++) {
                digits.push(this._digits[n] & other._digits[n]);
            }

            return BigInteger.create(true, digits);
        };

        /** O(min(this.digits, other.digits)) */
        BigInteger.prototype.eq = function (other) {
            function arrayEquals(a, b) {
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
        };

        /** O(this.digits) */
        BigInteger.prototype.toInt = function () {
            // Hack-y, but simple
            var str = this.toString();
            var n = parseInt(str);
            if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
                throw "toInt can only work with small BigIntegers.";
            }

            return n;
        };

        /** O(this.digits) */
        BigInteger.prototype.toString = function () {
            var padNum = function (n, len) {
                var str = n.toString();
                while (str.length < len) {
                    str = '0' + str;
                }
                return str;
            };

            var result = "";

            for (var n = 0; n < this._digits.length - 1; n++) {
                result = padNum(this._digits[n], BigInteger.BASE_LOG10) + result;
            }
            result = this._digits[this._digits.length - 1].toString() + result;

            if (!this._isPositive) {
                result = "-" + result;
            }

            return result;
        };

        /** O(this.digits + n) */
        BigInteger.prototype.leftShift = function (n) {
            var digits = new Array(this._digits.length + n);

            for (var i = 0; i < n; i++) {
                digits[i] = 0;
            }

            for (var i = 0; i < this._digits.length; i++) {
                digits[i + n] = this._digits[i];
            }

            return BigInteger.create(this._isPositive, digits);
        };

        /** O(this.digits + n) */
        BigInteger.prototype.pushRight = function (n) {
            var digits = new Array(this._digits.length + 1);

            digits[0] = n;
            for (var i = 0; i < this._digits.length; i++) {
                digits[i + 1] = this._digits[i];
            }

            return BigInteger.create(this._isPositive, digits);
        };

        /** O(this.digits + n) */
        BigInteger.prototype.rightShiftAbs = function (n) {
            var digits = new Array(this._digits.length - n);

            for (var i = 0; i < digits.length; i++) {
                digits[i] = this._digits[i + n];
            }

            return BigInteger.create(true, digits);
        };

        /** O(digits). Assumes that mul is positive. */
        BigInteger.prototype.singleDigitMul = function (mul) {
            var digits = Array(this._digits.length + 1);
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
        };

        /** O(digits) */
        BigInteger.create = function (isPositive, digits) {
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
        };

        /** O(1) */
        BigInteger.uncheckedCreate = function (isPositive, digits) {
            var bi = new BigInteger();
            bi._isPositive = isPositive;
            bi._digits = digits;
            return bi;
        };
        BigInteger.MAX_SAFE_INT = 9007199254740991;
        BigInteger.BASE = 10000000;
        BigInteger.BASE_LOG10 = Math.floor(Math.log(BigInteger.BASE) / Math.log(10));

        BigInteger.MINUS_ONE = BigInteger.uncheckedCreate(false, [1]);
        BigInteger.ZERO = BigInteger.uncheckedCreate(true, [0]);
        BigInteger.ONE = BigInteger.uncheckedCreate(true, [1]);
        BigInteger.TWO = BigInteger.uncheckedCreate(true, [2]);
        return BigInteger;
    })();

    
    return BigInteger;
});
//# sourceMappingURL=BigInteger.js.map
