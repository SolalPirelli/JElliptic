define(["require", "exports"], function(require, exports) {
    var BigInteger = (function () {
        function BigInteger() {
        }
        BigInteger.fromInt = function (n) {
            if (Math.abs(n) > BigInteger.MAX_SAFE_INT) {
                throw "BigInteger.fromInt cannot be called with inexact integers.";
            }

            var sign = n >= 0 ? 1 : -1;
            var digits = Array();

            n = Math.abs(n);

            do {
                var rem = n % BigInteger.BASE;
                n = Math.floor(n / BigInteger.BASE);

                digits.push(rem);
            } while(n != 0);

            return BigInteger.create(sign, digits);
        };

        // This is a bit too complex for bases that are powers of ten, but it works with any base
        BigInteger.parse = function (str) {
            var sign = 1;
            if (str[0] == "-") {
                sign = -1;
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

            return BigInteger.create(sign, digits);
        };

        BigInteger.prototype.negate = function () {
            return BigInteger.create(-this._sign, this._digits.slice(0));
        };

        BigInteger.prototype.abs = function () {
            if (this._sign == 1) {
                return this;
            }
            return BigInteger.create(1, this._digits.slice(0));
        };

        BigInteger.prototype.add = function (other) {
            var thisAbs = this.abs();
            var otherAbs = other.abs();
            var thisIsGreater = thisAbs.gt(otherAbs) || thisAbs.eq(otherAbs) && this._sign == 1;
            var hi = thisIsGreater ? this : other;
            var lo = thisIsGreater ? other : this;

            var digits = Array();
            var loSign = hi._sign == lo._sign ? 1 : -1;

            var carry = 0;

            for (var n = 0; n < hi._digits.length; n++) {
                var current = hi._digits[n] + loSign * (lo._digits[n] || 0) + carry;

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

            return BigInteger.create(hi._sign, digits);
        };

        BigInteger.prototype.sub = function (other) {
            return this.add(other.negate());
        };

        // http://en.wikipedia.org/wiki/Karatsuba_algorithm
        BigInteger.prototype.mul = function (other) {
            function singleDigitMul(bi, mul, mulSign) {
                var digits = Array();
                var carry = 0;
                for (var n = 0; n < bi._digits.length; n++) {
                    var digit = bi._digits[n] * mul + carry;
                    carry = Math.floor(digit / BigInteger.BASE);
                    digit %= BigInteger.BASE;
                    digits.push(digit);
                }
                if (carry != 0) {
                    digits.push(carry);
                }

                return BigInteger.create(mulSign * bi._sign, digits);
            }

            if (this._digits.length == 1) {
                return singleDigitMul(other, this._digits[0], this._sign);
            }

            if (other._digits.length == 1) {
                return singleDigitMul(this, other._digits[0], other._sign);
            }

            var m = Math.max(this._digits.length, other._digits.length);
            var m2 = Math.ceil(m / 2);

            var lo1 = BigInteger.create(this._sign, this._digits.slice(0, m2));
            var hi1 = BigInteger.create(this._sign, this._digits.slice(m2));
            var lo2 = BigInteger.create(other._sign, other._digits.slice(0, m2));
            var hi2 = BigInteger.create(other._sign, other._digits.slice(m2));

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
        };

        // Simple long division, sufficient for now
        BigInteger.prototype.div = function (other) {
            var quotient = this;
            var result = BigInteger.ZERO;

            while (quotient.gte(other)) {
                quotient = quotient.sub(other);
                result = result.add(BigInteger.ONE);
            }

            return result;
        };

        BigInteger.prototype.mod = function (n) {
            var result = this;

            if (this._sign == 1) {
                while (result.gte(n)) {
                    result = result.sub(n);
                }
            } else {
                while (BigInteger.ZERO.gt(result)) {
                    result = result.add(n);
                }
            }

            return result;
        };

        BigInteger.prototype.modInverse = function (n) {
            var t = BigInteger.ZERO, newt = BigInteger.ONE;
            var r = n, newr = this;
            while (!newr.eq(BigInteger.ZERO)) {
                var quotient = r.div(newr);

                var oldt = t;
                t = newt;
                newt = oldt.sub(quotient.mul(newt));

                var oldr = r;
                r = newr;
                newr = oldr.sub(quotient.mul(newr));
            }
            if (r.gt(BigInteger.ONE)) {
                throw (this + " is not invertible");
            }
            if (t._sign == -1) {
                t = t.add(n);
            }
            return t;
        };

        BigInteger.prototype.lte = function (other) {
            if (this._sign < other._sign) {
                return true;
            }
            if (this._sign > other._sign) {
                return false;
            }
            if (this._digits.length < other._digits.length) {
                return this._sign == 1;
            }
            if (this._digits.length > other._digits.length) {
                return this._sign == -1;
            }
            for (var n = this._digits.length - 1; n >= 0; n--) {
                if (this._digits[n] < other._digits[n]) {
                    return this._sign == 1;
                }
                if (this._digits[n] > other._digits[n]) {
                    return this._sign == -1;
                }
            }
            return true;
        };

        BigInteger.prototype.lt = function (other) {
            return !this.gte(other);
        };

        BigInteger.prototype.gte = function (other) {
            if (this._sign > other._sign) {
                return true;
            }
            if (this._sign < other._sign) {
                return false;
            }
            if (this._digits.length > other._digits.length) {
                return this._sign == 1;
            }
            if (this._digits.length < other._digits.length) {
                return this._sign == -1;
            }
            for (var n = this._digits.length - 1; n >= 0; n--) {
                if (this._digits[n] > other._digits[n]) {
                    return this._sign == 1;
                }
                if (this._digits[n] < other._digits[n]) {
                    return this._sign == -1;
                }
            }
            return true;
        };

        BigInteger.prototype.gt = function (other) {
            return !this.lte(other);
        };

        BigInteger.prototype.and = function (other) {
            var digits = Array();

            for (var n = 0; n < this._digits.length && n < other._digits.length; n++) {
                digits.push(this._digits[n] & other._digits[n]);
            }

            return BigInteger.create(1, digits);
        };

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

            return this._sign == other._sign && arrayEquals(this._digits, other._digits);
        };

        BigInteger.prototype.toInt = function () {
            // Hack-y, but simple
            var str = this.toString();
            var n = parseInt(str);
            if (n > BigInteger.MAX_SAFE_INT) {
                throw "toInt can only work with small BigIntegers.";
            }

            return n;
        };

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

            if (this._sign == -1) {
                result = "-" + result;
            }

            return result;
        };

        BigInteger.prototype.leftShift = function (n) {
            var digits = this._digits.slice(0);
            for (var _ = 0; _ < n; _++) {
                digits.unshift(0);
            }
            return BigInteger.create(this._sign, digits);
        };

        BigInteger.create = function (sign, digits) {
            // Remove useless digits
            var actualLength = digits.length;
            while (actualLength > 0 && digits[actualLength - 1] == 0) {
                actualLength--;
            }

            if (actualLength == 0) {
                return BigInteger.ZERO;
            }

            var bi = new BigInteger();
            bi._sign = sign;
            bi._digits = digits.slice(0, actualLength);
            return bi;
        };

        BigInteger.uncheckedCreate = function (sign, digits) {
            var bi = new BigInteger();
            bi._sign = sign;
            bi._digits = digits;
            return bi;
        };
        BigInteger.MAX_SAFE_INT = 9007199254740991;
        BigInteger.BASE = 10000000;
        BigInteger.BASE_LOG10 = Math.floor(Math.log(BigInteger.BASE) / Math.log(10));

        BigInteger.ZERO = BigInteger.uncheckedCreate(1, [0]);
        BigInteger.ONE = BigInteger.uncheckedCreate(1, [1]);
        return BigInteger;
    })();

    
    return BigInteger;
});
//# sourceMappingURL=BigInteger.js.map
