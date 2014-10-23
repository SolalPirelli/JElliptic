define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    var ModNumber = (function () {
        function ModNumber(value, n) {
            this._value = value.mod(n);
            this._n = n.clone();
        }
        Object.defineProperty(ModNumber.prototype, "value", {
            get: function () {
                return this._value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModNumber.prototype, "n", {
            get: function () {
                return this._n;
            },
            enumerable: true,
            configurable: true
        });

        ModNumber.prototype.negate = function () {
            return new ModNumber(this._value.negate(), this._n);
        };

        ModNumber.prototype.invert = function () {
            return new ModNumber(this._value.modInverse(this._n), this._n);
        };

        ModNumber.prototype.add = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.add(other._value), this._n);
        };

        ModNumber.prototype.addNum = function (n) {
            return new ModNumber(this._value.add(BigInteger.fromInt(n)), this._n);
        };

        ModNumber.prototype.sub = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.sub(other._value), this._n);
        };

        ModNumber.prototype.mul = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.mul(other._value), this._n);
        };

        ModNumber.prototype.mulNum = function (n) {
            return new ModNumber(this._value.mul(BigInteger.fromInt(n)), this._n);
        };

        ModNumber.prototype.div = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.mul(other._value.modInverse(this._n)), this._n);
        };

        ModNumber.prototype.pow = function (n) {
            var result = new ModNumber(BigInteger.ONE, this.n);
            for (var _ = 0; _ < n; _++) {
                result = result.mul(this);
            }
            return result;
        };

        ModNumber.prototype.eq = function (other) {
            this.ensureCompatible(other);

            return this._value.eq(other._value);
        };

        ModNumber.prototype.toString = function () {
            return this._value + " mod " + this._n;
        };

        ModNumber.prototype.ensureCompatible = function (other) {
            if (!this._n.eq(other._n)) {
                throw "Incompatible ModNums";
            }
        };
        return ModNumber;
    })();

    
    return ModNumber;
});
//# sourceMappingURL=ModNumber.js.map
