define(["require", "exports"], function(require, exports) {
    var BigInteger = (function () {
        function BigInteger() {
        }
        BigInteger.fromInt = function (n) {
            if (n > BigInteger.MAX_SAFE_INT) {
                throw "BigInteger.fromInt(number) cannot be called with inexact integers.";
            }

            var sign = n >= 0 ? 1 : -1;
            var digits = [];

            n = Math.abs(n);

            do {
                var rem = n % BigInteger.BASE;
                n = Math.floor(n / BigInteger.BASE);

                digits.push(rem);
            } while(n != 0);

            return BigInteger.create(sign, digits);
        };

        BigInteger.parse = function (str) {
            var sign = 1;
            if (str[0] == "-") {
                sign = -1;
                str = str.substring(1);
            }

            // trim leading 0s
            var begin = 0;
            while (str[begin] == "0") {
                begin++;
            }
            str = str.substring(begin);

            var chunksLength = Math.ceil(str.length / BigInteger.BASE_TENDIGIT_COUNT);
            var chunks = [];

            for (var n = 0; n < chunksLength; n++) {
                var end = str.length - n * BigInteger.BASE_TENDIGIT_COUNT;
                chunks[n] = str.substring(Math.max(0, end - BigInteger.BASE_TENDIGIT_COUNT), end);
            }

            return BigInteger.create(sign, chunks.map(Number));
        };

        BigInteger.prototype.negate = function () {
            return BigInteger.create(-this.sign, this.digits.slice(0));
        };

        BigInteger.prototype.abs = function () {
            return BigInteger.create(1, this.digits.slice(0));
        };

        BigInteger.prototype.clone = function () {
            return BigInteger.create(this.sign, this.digits.slice(0));
        };

        BigInteger.prototype.add = function (other) {
            var thisIsGreater = this.gte(other);
            var hi = thisIsGreater ? this : other;
            var lo = thisIsGreater ? other : this;

            var digits = [];
            var loSign = hi.sign == lo.sign ? 1 : -1;

            var carry = 0;

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

            // at the end carry is always >= 0
            if (carry != 0) {
                digits[hi.digits.length] = carry;
            }

            return BigInteger.create(hi.sign, digits);
        };

        BigInteger.prototype.sub = function (other) {
            return this.add(other.negate());
        };

        // http://en.wikipedia.org/wiki/Karatsuba_algorithm
        BigInteger.prototype.mul = function (other) {
            // this function assumes num1 and num2 are both >0
            var karatsuba = function (num1, num2) {
                if (num1.digits.length == 1 && num2.digits.length == 1) {
                    return BigInteger.fromInt(num1.digits[0] * num2.digits[0]);
                }

                var m = Math.max(num1.digits.length, num2.digits.length);
                var m2 = Math.ceil(m / 2);

                var lo1 = BigInteger.create(1, num1.digits.slice(0, m2));
                var hi1 = BigInteger.create(1, num1.digits.slice(m2, num1.digits.length));
                var lo2 = BigInteger.create(1, num2.digits.slice(0, m2));
                var hi2 = BigInteger.create(1, num2.digits.slice(m2, num2.digits.length));

                var z0 = karatsuba(lo1, lo2);
                var z1 = karatsuba(lo1.add(hi1), lo2.add(hi2));
                var z2 = karatsuba(hi1, hi2);

                var r1 = z2.leftShift(2 * m2);
                var r2 = z1.sub(z2).sub(z0).leftShift(m2);

                return r1.add(r2).add(z0);
            };

            return BigInteger.create(this.sign * other.sign, karatsuba(this.abs(), other.abs()).digits);
        };

        // Simple long division, sufficient for now
        BigInteger.prototype.div = function (other) {
            var quotient = this;
            var result = BigInteger.Zero;

            while (quotient.gte(other)) {
                quotient = quotient.sub(other);
                result = result.add(BigInteger.One);
            }

            return result;
        };

        BigInteger.prototype.mod = function (n) {
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
        };

        BigInteger.prototype.modInverse = function (n) {
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
        };

        BigInteger.prototype.lte = function (other) {
            if (this.digits.length > other.digits.length) {
                return true;
            }
            if (other.digits.length > this.digits.length) {
                return false;
            }
            return this.digits[this.digits.length - 1] <= other.digits[other.digits.length - 1];
        };

        BigInteger.prototype.lt = function (other) {
            if (this.digits.length > other.digits.length) {
                return true;
            }
            if (other.digits.length > this.digits.length) {
                return false;
            }
            return this.digits[this.digits.length - 1] < other.digits[other.digits.length - 1];
        };

        BigInteger.prototype.gte = function (other) {
            if (this.digits.length > other.digits.length) {
                return true;
            }
            if (other.digits.length > this.digits.length) {
                return false;
            }
            return this.digits[this.digits.length - 1] >= other.digits[other.digits.length - 1];
        };

        BigInteger.prototype.gt = function (other) {
            if (this.digits.length > other.digits.length) {
                return true;
            }
            if (other.digits.length > this.digits.length) {
                return false;
            }
            return this.digits[this.digits.length - 1] > other.digits[other.digits.length - 1];
        };

        BigInteger.prototype.leftShift = function (n) {
            var digits = this.digits.slice(0);
            for (var _ = 0; _ < n; _++) {
                digits.unshift(0);
            }
            return BigInteger.create(this.sign, digits);
        };

        BigInteger.prototype.and = function (other) {
            var digits = [];

            for (var n = 0; n < this.digits.length || n < other.digits.length; n++) {
                digits.push((this.digits[n] || 0) & (other.digits[n] || 0));
            }

            // TODO: what about the sign ?
            return BigInteger.create(1, digits);
        };

        BigInteger.prototype.eq = function (other) {
            var arrayEquals = function (a, b) {
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
            };

            return this.sign == other.sign && arrayEquals(this.digits, other.digits);
        };

        BigInteger.prototype.toInt = function () {
            // TODO make this work with ones up to max_safe_int
            if (this.digits.length > 1) {
                throw "toInt can only work with small BigIntegers.";
            }

            return this.digits[0] * this.sign;
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

            for (var n = 0; n < this.digits.length - 1; n++) {
                result = padNum(this.digits[n], BigInteger.BASE_TENDIGIT_COUNT) + result;
            }
            result = this.digits[this.digits.length - 1].toString() + result;

            if (this.sign == -1) {
                result = "-" + result;
            }

            return result;
        };

        BigInteger.create = function (sign, digits) {
            var bi = new BigInteger();
            bi.sign = sign;
            bi.digits = digits.length > 0 ? digits : [0];
            return bi;
        };
        BigInteger.MAX_SAFE_INT = 9007199254740991;
        BigInteger.BASE_TENDIGIT_COUNT = 7;
        BigInteger.BASE = Math.pow(10, BigInteger.BASE_TENDIGIT_COUNT);

        BigInteger.Zero = BigInteger.create(1, [0]);
        BigInteger.One = BigInteger.create(1, [1]);
        return BigInteger;
    })();

    
    return BigInteger;
});
//# sourceMappingURL=BigInteger.js.map
