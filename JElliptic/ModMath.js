define(["require", "exports"], function(require, exports) {
    var ModMath;
    (function (ModMath) {
        // Non-negative mod
        function mod(a, n) {
            return ((a % n) + n) % n;
        }
        ModMath.mod = mod;

        // from http://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
        function modInverse(a, n) {
            var t = 0, newt = 1;
            var r = n, newr = a;
            while (newr != 0) {
                var quotient = Math.floor(r / newr);

                var oldt = t;
                t = newt;
                newt = oldt - quotient * newt;

                var oldr = r;
                r = newr;
                newr = oldr - quotient * newr;
            }
            if (r > 1) {
                throw (a + " is not invertible");
            }
            if (t < 0) {
                t = t + n;
            }
            return t;
        }
        ModMath.modInverse = modInverse;
    })(ModMath || (ModMath = {}));

    
    return ModMath;
});
//# sourceMappingURL=ModMath.js.map
