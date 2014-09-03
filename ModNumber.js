define(["require", "exports", "ModMath"], function(require, exports, ModMath) {
    var ModNumber = (function () {
        function ModNumber(value, n) {
            this.value = ModMath.mod(value, n);
            this.n = n;
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
            return new ModNumber(-this.value, this.n);
        };

        ModNumber.prototype.add = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value + other.value, this.n);
        };

        ModNumber.prototype.addNum = function (n) {
            return new ModNumber(this.value + n, this.n);
        };

        ModNumber.prototype.sub = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value - other.value, this.n);
        };

        ModNumber.prototype.mul = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value * other.value, this.n);
        };

        ModNumber.prototype.mulNum = function (n) {
            return new ModNumber(n * this.value, this.n);
        };

        ModNumber.prototype.div = function (other) {
            this.ensureCompatible(other);

            return new ModNumber(this.value * ModMath.modInverse(other.value, this.n), this.n);
        };

        ModNumber.prototype.pow = function (n) {
            var result = new ModNumber(1, this.N);
            for (var _ = 0; _ < n; _++) {
                result = result.mul(this);
            }
            return result;
        };

        ModNumber.prototype.eq = function (other) {
            this.ensureCompatible(other);

            return this.value == other.value;
        };

        ModNumber.prototype.toString = function () {
            return this.value + " mod " + this.n;
        };

        ModNumber.prototype.ensureCompatible = function (other) {
            if (this.n != other.n) {
                throw "Incompatible ModNums";
            }
        };
        return ModNumber;
    })();

    
    return ModNumber;
});
//# sourceMappingURL=ModNumber.js.map
