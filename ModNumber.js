define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    // TODO try to eliminate usages of create() here, make stuff smarter
    var ModNumber = (function () {
        function ModNumber() {
        }
        ModNumber.create = function (value, n) {
            var modNum = new ModNumber();
            modNum._value = value.divRem(n)[1];
            modNum._n = n;
            return modNum;
        };

        ModNumber.createUnchecked = function (value, n) {
            var modNum = new ModNumber();
            modNum._value = value;
            modNum._n = n;
            return modNum;
        };

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

        /** sub */
        ModNumber.prototype.negate = function () {
            return ModNumber.createUnchecked(this._n.sub(this._value), this._n);
        };

        /** modInverse */
        ModNumber.prototype.invert = function () {
            return ModNumber.createUnchecked(this._value.modInverse(this._n), this._n);
        };

        /** add + compare + sub */
        ModNumber.prototype.add = function (other) {
            var sum = this._value.add(other._value);
            if (sum.compare(this._n) > -1) {
                sum = sum.sub(this._n);
            }

            return ModNumber.createUnchecked(sum, this._n);
        };

        /** sub + add */
        ModNumber.prototype.sub = function (other) {
            var diff = this._value.sub(other._value);
            if (!diff.isPositive) {
                diff = diff.add(this._n);
            }
            return ModNumber.createUnchecked(diff, this._n);
        };

        /** mul */
        ModNumber.prototype.mul = function (other) {
            return ModNumber.create(this._value.mul(other._value), this._n);
        };

        /** mul */
        ModNumber.prototype.mulNum = function (n) {
            return ModNumber.create(this._value.mul(BigInteger.fromInt(n)), this._n);
        };

        /** mul + modInverse */
        ModNumber.prototype.div = function (other) {
            return ModNumber.create(this._value.mul(other._value.modInverse(this._n)), this._n);
        };

        /** mul * n */
        ModNumber.prototype.pow = function (n) {
            var result = BigInteger.ONE;
            for (var _ = 0; _ < n; _++) {
                result = result.mul(this._value).divRem(this._n)[1];
            }
            return ModNumber.createUnchecked(result, this._n);
        };

        /** compare */
        ModNumber.prototype.compare = function (other) {
            return this._value.compare(other._value);
        };

        /** eq */
        ModNumber.prototype.eq = function (other) {
            return this._value.eq(other._value);
        };

        /** toString */
        ModNumber.prototype.toString = function () {
            return this._value.toString() + " mod " + this._n.toString();
        };
        return ModNumber;
    })();

    
    return ModNumber;
});
//# sourceMappingURL=ModNumber.js.map
