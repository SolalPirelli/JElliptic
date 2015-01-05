"use strict";
define(["require", "exports", "ModNumber", "ModPointAddPartialResult"], function(require, exports, ModNumber, ModPointAddPartialResult) {
    var ModPoint = (function () {
        function ModPoint(x, y, curve) {
            this._x = x;
            this._y = y;
            this._curve = curve;
        }
        ModPoint.fromBigInts = function (x, y, curve) {
            return new ModPoint(ModNumber.create(x, curve.n), ModNumber.create(y, curve.n), curve);
        };

        Object.defineProperty(ModPoint.prototype, "x", {
            get: function () {
                return this._x;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPoint.prototype, "y", {
            get: function () {
                return this._y;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPoint, "INFINITY", {
            get: function () {
                return ModPoint.INF;
            },
            enumerable: true,
            configurable: true
        });

        /** O(1) */
        ModPoint.prototype.negate = function () {
            if (this == ModPoint.INF) {
                return this;
            }
            return new ModPoint(this._x, this._y.negate(), this._curve);
        };

        ModPoint.prototype.add = function (other) {
            var partial = this.beginAdd(other);
            if (partial.result != null) {
                return partial.result;
            }
            return this.endAdd(other, partial.numerator.div(partial.denominator));
        };

        ModPoint.prototype.beginAdd = function (other) {
            // Case 1: One of the points is infinity -> return the other
            if (this == ModPoint.INF) {
                return new ModPointAddPartialResult(null, null, other);
            }
            if (other == ModPoint.INF) {
                return new ModPointAddPartialResult(null, null, this);
            }

            // Case 2: The points are vertically symmetric -> return infinity
            if (this._x.compare(other._x) == 0 && this._y.compare(other._y.negate()) == 0) {
                return new ModPointAddPartialResult(null, null, ModPoint.INF);
            }

            var num, denom;
            if (this.eq(other)) {
                // Case 3: The points are equal -> double the current point
                num = this._x.square().mulNum(3).add(this._curve.a);
                denom = this._y.mulNum(2);
            } else {
                // Case 4: Add the two points
                num = other._y.sub(this._y);
                denom = other._x.sub(this._x);
            }

            return new ModPointAddPartialResult(num, denom, null);
        };

        ModPoint.prototype.endAdd = function (other, lambda) {
            var x = lambda.square().sub(this._x).sub(other._x);
            var y = lambda.mul(this._x.sub(x)).sub(this._y);

            return new ModPoint(x, y, this._curve);
        };

        /** O(n) */
        ModPoint.prototype.mulNum = function (n) {
            var result = ModPoint.INF;
            var currentAdding = this;

            while (n != 0) {
                if ((n & 1) == 1) {
                    result = result.add(currentAdding);
                }

                n >>= 1;
                if (n != 0) {
                    // This is expensive, don't do it if we're not going to use it
                    currentAdding = currentAdding.add(currentAdding);
                }
            }

            return result;
        };

        /** O(this.value.digits / n) */
        ModPoint.prototype.partition = function (n) {
            if (this == ModPoint.INF) {
                return 0;
            }
            return this._x.value.partition(n);
        };

        ModPoint.prototype.compareY = function (other) {
            if (this == ModPoint.INF) {
                return other == ModPoint.INF ? 0 : 1;
            }
            if (other == ModPoint.INF) {
                return -1;
            }

            return this._y.compare(other._y);
        };

        /** O(min(this.x.value.digits, other.x.value.digits) + min(this.y.value.digits, other.y.value.digits)) */
        ModPoint.prototype.eq = function (other) {
            if (this == ModPoint.INF) {
                return other == ModPoint.INF;
            }
            if (other == ModPoint.INF) {
                return false;
            }

            return this._x.compare(other._x) == 0 && this._y.compare(other._y) == 0;
        };

        /** O(this.x.value.digits + this.y.value.digits) */
        ModPoint.prototype.toString = function () {
            if (this == ModPoint.INF) {
                return "Infinity";
            }
            return "(" + this._x.value.toString() + ", " + this._y.value.toString() + ")";
        };
        ModPoint.INF = new ModPoint(null, null, null);
        return ModPoint;
    })();

    
    return ModPoint;
});
//# sourceMappingURL=ModPoint.js.map
