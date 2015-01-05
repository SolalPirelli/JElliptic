"use strict";
define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    var ModNumber = (function () {
        /** Unsafe: does not do mod operations */
        function ModNumber(value, n) {
            this._value = value;
            this._n = n;
        }
        ModNumber.create = function (value, n) {
            return new ModNumber(value.divRem(n)[1], n);
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
            return new ModNumber(this._n.sub(this._value), this._n);
        };

        /** modInverse */
        ModNumber.prototype.invert = function () {
            return new ModNumber(this._value.modInverse(this._n), this._n);
        };

        /** mul */
        ModNumber.prototype.square = function () {
            return ModNumber.create(this._value.mul(this._value), this._n);
        };

        /** add + compare + sub */
        ModNumber.prototype.add = function (other) {
            var sum = this._value.add(other._value);
            if (sum.compare(this._n) > -1) {
                sum = sum.sub(this._n);
            }

            return new ModNumber(sum, this._n);
        };

        /** sub + add */
        ModNumber.prototype.sub = function (other) {
            var diff = this._value.sub(other._value);
            if (!diff.isPositive) {
                diff = diff.add(this._n);
            }
            return new ModNumber(diff, this._n);
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
            return this.mul(other.invert());
        };

        /** compare */
        ModNumber.prototype.compare = function (other) {
            return this._value.compare(other._value);
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
