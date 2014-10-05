define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    var ModNumber = (function () {
        function ModNumber(value, n) {
            this.value = value.mod(n);
            this.n = n.clone();
        }
        Object.defineProperty(ModNumber.prototype, "Value", {
            get: function () {
                return this.value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModNumber.prototype, "N", {
            get: function () {
                return this.n;
            },
            enumerable: true,
            configurable: true
        });

        ModNumber.prototype.negate = function () {
            return new ModNumber(this.value.negate(), this.n);
        };

        ModNumber.prototype.invert = function () {
            return new ModNumber(this.value.modInverse(this.n), this.n);
        };

        ModNumber.prototype.add = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value.add(other.value), this.n);
        };

        ModNumber.prototype.addNum = function (n) {
            return new ModNumber(this.value.add(BigInteger.fromInt(n)), this.n);
        };

        ModNumber.prototype.sub = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value.sub(other.value), this.n);
        };

        ModNumber.prototype.mul = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value.mul(other.value), this.n);
        };

        ModNumber.prototype.mulNum = function (n) {
            return new ModNumber(this.value.mul(BigInteger.fromInt(n)), this.n);
        };

        ModNumber.prototype.div = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value.mul(other.value.modInverse(this.n)), this.n);
        };

        ModNumber.prototype.pow = function (n) {
            var result = new ModNumber(BigInteger.One, this.N);
            for (var _ = 0; _ < n; _++) {
                result = result.mul(this);
            }
            return result;
        };

        ModNumber.prototype.eq = function (other) {
            this.ensureCompatible(other);

            return this.value.eq(other.value);
        };

        ModNumber.prototype.toString = function () {
            return this.value + " mod " + this.n;
        };

        ModNumber.prototype.ensureCompatible = function (other) {
            if (!this.n.eq(other.n)) {
                throw "Incompatible ModNums";
            }
        };
        return ModNumber;
    })();

    
    return ModNumber;
});
//# sourceMappingURL=ModNumber.js.map
