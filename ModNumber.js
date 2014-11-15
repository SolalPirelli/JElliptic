define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    var ModNumber = (function () {
        function ModNumber(value, n) {
            this._value = value.mod(n);
            this._n = n;
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

        /** O(1) */
        ModNumber.prototype.negate = function () {
            return new ModNumber(this._value.negate(), this._n);
        };

        /** O(log(this.n)^2) */
        ModNumber.prototype.invert = function () {
            return new ModNumber(this._value.modInverse(this._n), this._n);
        };

        /** O(max(this.value.digits, other.value.digits)) */
        ModNumber.prototype.add = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.add(other._value), this._n);
        };

        /** O(this.digits) */
        ModNumber.prototype.addNum = function (n) {
            return new ModNumber(this._value.add(BigInteger.fromInt(n)), this._n);
        };

        /** O(max(this.value.digits, other.value.digits)) */
        ModNumber.prototype.sub = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.sub(other._value), this._n);
        };

        /** O(max(this.value.digits, other.value.digits)^log_2(3)) */
        ModNumber.prototype.mul = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.mul(other._value), this._n);
        };

        /** O(this.digits)^log_2(3)) */
        ModNumber.prototype.mulNum = function (n) {
            return new ModNumber(this._value.mul(BigInteger.fromInt(n)), this._n);
        };

        /** O(log(n)^2 + max(this.value.digits, other.value.digits)^log_2(3)) */
        ModNumber.prototype.div = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this._value.mul(other._value.modInverse(this._n)), this._n);
        };

        /** O(n * (this.digits ^ log_2(3))) */
        ModNumber.prototype.pow = function (n) {
            var result = new ModNumber(BigInteger.ONE, this.n);
            for (var _ = 0; _ < n; _++) {
                result = result.mul(this);
            }
            return result;
        };

        /** O(min(this.value.digits, other.value.digits)) */
        ModNumber.prototype.eq = function (other) {
            this.ensureCompatible(other);

            return this._value.eq(other._value);
        };

        /** O(this.value.digits + this.n.digits) */
        ModNumber.prototype.toString = function () {
            return this._value.toString() + " mod " + this._n.toString();
        };

        /** O(this.n.digits) */
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
