"use strict";
define(["require", "exports"], function(require, exports) {
    var BigInteger = (function () {
        /** Unsafe: does not trim zeroes. */
        function BigInteger(isPositive, digits) {
            this._isPositive = isPositive;
            this._digits = digits;
        }
        Object.defineProperty(BigInteger, "MINUS_ONE", {
            get: function () {
                return new BigInteger(false, [1]);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BigInteger, "ZERO", {
            get: function () {
                return new BigInteger(true, [0]);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BigInteger, "ONE", {
            get: function () {
                return new BigInteger(true, [1]);
            },
            enumerable: true,
            configurable: true
        });

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

            return new BigInteger(isPositive, digits.slice(0, actualLength));
        };

        /** O(1) */
        BigInteger.fromInt = function (num) {
            if (num == 0) {
                return BigInteger.ZERO;
            }
            if (num == 1) {
                return BigInteger.ONE;
            }
            if (num == -1) {
                return BigInteger.MINUS_ONE;
            }

            var isPositive = num >= 0;
            num = Math.abs(num);

            if (num > BigInteger.MAX_SAFE_INT) {
                throw "BigInteger.fromInt cannot be called with inexact integers.";
            }

            var digitsCount = Math.ceil(Math.log(num) / BigInteger.BASE_LOG);
            var digits = [];

            for (var i = 0; i < digitsCount; i++) {
                var rem = num % BigInteger.BASE;
                num = Math.floor(num / BigInteger.BASE);
                digits[i] = rem;
            }

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

            var num = SlowBigIntegers.parse(str);
            var result = BigInteger.ZERO;
            var multiplier = BigInteger.ONE;
            for (var n = 0; n < num.length; n++) {
                result = result.add(multiplier.singleDigitMul(num[n]));
                multiplier = multiplier.mul(SlowBigIntegers.BASE_AS_NORMAL);
            }

            if (!isPositive) {
                result = result.negate();
            }
            return result;
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
            return new BigInteger(true, this._digits);
        };

        /** O(this.digits)
        Rounds down. */
        BigInteger.prototype.halve = function () {
            var digits = [];
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

            var hi = this._digits;
            var lo = other._digits;

            if (this._digits.length < other._digits.length) {
                hi = other._digits;
                lo = this._digits;
            }

            var digits = [];
            var carry = 0;

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

            var digits = [];
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
            var digits = [];

            for (var n = 0; n < this._digits.length + other._digits.length + 1; n++) {
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

            var digits = [];
            var remainder = BigInteger.ZERO;
            for (var n = dividend._digits.length - 1; n >= 0; n--) {
                remainder.MUTATE_pushRight(dividend._digits[n]);
                if (remainder.compare(divisor) == -1) {
                    digits[n] = 0;
                } else {
                    // Since remainder just became bigger than divisor,
                    // its length is either divisor's or one more
                    var highRemainder, highDivisor;
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

                    var actual;
                    while (guess > 0) {
                        actual = divisor.singleDigitMul(guess);
                        if (actual.compareAbs(remainder) < 1) {
                            break;
                        }
                        guess--;
                    }

                    remainder.MUTATE_sub(actual);
                    digits[n] = guess;
                }
            }

            if (!this._isPositive) {
                remainder = divisor.sub(remainder);
            }

            return [BigInteger.create(isPositive, digits), remainder];
        };

        /** O(1) */
        BigInteger.prototype.partition = function (divisor) {
            return this._digits[0] % divisor;
        };

        /** O(log(n)^2) */
        BigInteger.prototype.modInverse = function (n) {
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
            var minLength = Math.min(this._digits.length, other._digits.length);
            var digits = [];

            for (var n = 0; n < minLength; n++) {
                digits[n] = this._digits[n] & other._digits[n];
            }

            return BigInteger.create(true, digits);
        };

        /** O(this.digits) */
        BigInteger.prototype.toString = function () {
            var result = SlowBigIntegers.ZERO;
            var multiplier = SlowBigIntegers.ONE;
            for (var n = 0; n < this._digits.length; n++) {
                var digit = SlowBigIntegers.fromInt(this._digits[n]);
                result = SlowBigIntegers.add(result, SlowBigIntegers.mul(digit, multiplier));
                multiplier = SlowBigIntegers.mul(multiplier, SlowBigIntegers.NORMAL_BASE);
            }
            var str = SlowBigIntegers.toString(result);
            if (!this._isPositive) {
                str = "-" + str;
            }
            return str;
        };

        /** O(digits). Assumes that mul is positive. */
        BigInteger.prototype.singleDigitMul = function (mul) {
            var digits = [];
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

        /** Mutates the current instance.
        O(this.digits + n) */
        BigInteger.prototype.MUTATE_pushRight = function (n) {
            if (this._digits.length == 1 && this._digits[0] == 0) {
                this._digits[0] = n;
                return;
            }

            for (var i = this._digits.length; i > 0; i--) {
                this._digits[i] = this._digits[i - 1];
            }
            this._digits[0] = n;
        };

        /** Mutates the current instance.
        Assumes that this > other, this > 0, other > 0
        O(max(this.digits, other.digits)) */
        BigInteger.prototype.MUTATE_sub = function (other) {
            var carry = 0;
            var n = 0;

            for (; n < other._digits.length; n++) {
                var current = this._digits[n] - other._digits[n] - carry;

                if (current < 0) {
                    carry = 1;
                    current += BigInteger.BASE;
                } else {
                    carry = 0;
                }

                this._digits[n] = current;
            }

            for (; carry == 1 && n < this._digits.length; n++) {
                var current = this._digits[n] - carry;

                if (current < 0) {
                    carry = 1;
                    current += BigInteger.BASE;
                } else {
                    carry = 0;
                }

                this._digits[n] = current;
            }

            while (this._digits[this._digits.length - 1] == 0 && this._digits.length > 1) {
                this._digits.length--;
            }
        };
        BigInteger.MAX_SAFE_INT = 9007199254740991;

        BigInteger.BASE = 94906264;

        BigInteger.BASE_LOG = Math.log(BigInteger.BASE);
        return BigInteger;
    })();

    /**
    * This is an implementation of positive big integers, using a base that is a power of 10.
    * Powers of 10 are extremely convenient as bases to parse and stringify, but they require more space to store big ints, since
    * they're not as big as what can be used otherwise.
    * Therefore, this module implements only what's necessary to parse and stringify,
    * and BigInteger internally converts when one of these two methods is called.
    */
    var SlowBigIntegers;
    (function (SlowBigIntegers) {
        SlowBigIntegers.BASE = 10000000;

        // Cached stuff
        var BASE_LOG = Math.log(SlowBigIntegers.BASE);
        var BASE_LOG10 = Math.floor(BASE_LOG / Math.log(10));

        SlowBigIntegers.ZERO = [0];
        SlowBigIntegers.ONE = [1];

        function fromInt(num) {
            if (num == 0) {
                return SlowBigIntegers.ZERO;
            }
            if (num == 1) {
                return SlowBigIntegers.ONE;
            }

            var digitsCount = Math.ceil(Math.log(num) / BASE_LOG);
            var digits = [];

            for (var i = 0; i < digitsCount; i++) {
                var rem = num % SlowBigIntegers.BASE;
                num = Math.floor(num / SlowBigIntegers.BASE);
                digits[i] = rem;
            }

            return digits;
        }
        SlowBigIntegers.fromInt = fromInt;

        // Cached stuff; declared here otherwise SlowBigInteger.fromInt is undefined
        SlowBigIntegers.NORMAL_BASE = SlowBigIntegers.fromInt(BigInteger.BASE);
        SlowBigIntegers.BASE_AS_NORMAL = BigInteger.fromInt(SlowBigIntegers.BASE);

        function parse(str) {
            var chunksLength = Math.ceil(str.length / BASE_LOG10);
            var chunks = [];

            for (var n = 0; n < chunksLength; n++) {
                var end = str.length - n * BASE_LOG10;
                chunks[n] = str.substring(Math.max(0, end - BASE_LOG10), end);
            }

            return chunks.map(Number);
        }
        SlowBigIntegers.parse = parse;

        function add(left, right) {
            var hi = left;
            var lo = right;

            if (left.length < right.length) {
                hi = right;
                lo = left;
            }

            var digits = [];
            for (var n = 0; n < digits.length; n++) {
                digits[n] = 0;
            }

            var carry = 0;

            var n = 0;

            for (; n < lo.length; n++) {
                var current = hi[n] + lo[n] + carry;

                if (current >= SlowBigIntegers.BASE) {
                    carry = 1;
                    current -= SlowBigIntegers.BASE;
                } else {
                    carry = 0;
                }

                digits[n] = current;
            }

            for (; carry == 1 && n < hi.length; n++) {
                var current = hi[n] + carry;

                if (current >= SlowBigIntegers.BASE) {
                    carry = 1;
                    current -= SlowBigIntegers.BASE;
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

            return digits;
        }
        SlowBigIntegers.add = add;

        function mul(left, right) {
            var digits = [];

            for (var n = 0; n < left.length + right.length + 1; n++) {
                digits[n] = 0;
            }

            for (var n = 0; n < left.length; n++) {
                var carry = 0;
                for (var k = 0; k < right.length; k++) {
                    var sum = digits[n + k] + left[n] * right[k] + carry;
                    carry = Math.floor(sum / SlowBigIntegers.BASE);
                    sum = sum - SlowBigIntegers.BASE * carry;
                    digits[n + k] = sum;
                }
                if (carry != 0) {
                    // We can safely use = and no + here, as this cell hasn't been set yet
                    digits[n + right.length] = carry;
                }
            }

            return digits;
        }
        SlowBigIntegers.mul = mul;

        function toString(nums) {
            var padNum = function (n, len) {
                var str = n.toString();
                while (str.length < len) {
                    str = '0' + str;
                }
                return str;
            };

            // Trim useless 0s and undefineds
            var max = nums.length - 1;
            while (max > 0 && !nums[max]) {
                max--;
            }

            var result = "";

            for (var n = 0; n < max; n++) {
                result = padNum(nums[n], BASE_LOG10) + result;
            }
            result = nums[max].toString() + result;

            return result;
        }
        SlowBigIntegers.toString = toString;
    })(SlowBigIntegers || (SlowBigIntegers = {}));

    
    return BigInteger;
});
//# sourceMappingURL=BigInteger.js.map
