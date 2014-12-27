/// <reference path="lib/biginteger.d.ts"/>
define(["require", "exports"], function(require, exports) {
    var BigIntegers;
    (function (BigIntegers) {
        function and(left, right) {
            var min = Math.min(left._d.length, right._d.length);
            var digits = Array(min);
            for (var n = 0; n < min; n++) {
                digits[n] = left._d[n] & right._d[n];
            }

            return BigInteger._construct(digits, 1);
        }
        BigIntegers.and = and;

        function partition(bi, divisor) {
            var result = 0;
            for (var n = 0; n < bi._d.length; n++) {
                result += bi._d[n];
                result %= divisor;
            }
            return result;
        }
        BigIntegers.partition = partition;

        function modInverse(bi, n) {
            var t = BigInteger.ZERO, newt = BigInteger.ONE;
            var r = n, newr = bi;
            while (newr.compare(BigInteger.ZERO) != 0) {
                var quotient = r.divRem(newr)[0];

                var oldt = t;
                t = newt;
                newt = oldt.subtract(quotient.multiply(newt));

                var oldr = r;
                r = newr;
                newr = oldr.subtract(quotient.multiply(newr));
            }
            if (r.compare(BigInteger.ONE) == 1) {
                throw (this + " is not invertible");
            }
            if (!t.isPositive) {
                t = t.add(n);
            }
            return t;
        }
        BigIntegers.modInverse = modInverse;
    })(BigIntegers || (BigIntegers = {}));

    
    return BigIntegers;
});
//# sourceMappingURL=BigIntegers.js.map
