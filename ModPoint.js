define(["require", "exports", "BigInteger", "ModNumber", "ModPointAddPartialResult"], function(require, exports, BigInteger, ModNumber, ModPointAddPartialResult) {
    // N.B.: Ensuring the validity of a point on a curve is simply too slow
    //       Unit tests will have to do...
    var ModPoint = (function () {
        function ModPoint() {
        }
        ModPoint.create = function (x, y, curve) {
            var point = new ModPoint();
            point._x = new ModNumber(x, curve.n);
            point._y = new ModNumber(y, curve.n);
            point._curve = curve;
            return point;
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

        Object.defineProperty(ModPoint.prototype, "curve", {
            get: function () {
                return this._curve;
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
            return ModPoint.fromModNumbers(this._x, this._y.negate(), this._curve);
        };

        ModPoint.prototype.add = function (other) {
            // Case 1: One of the points is infinity -> return the other
            if (this == ModPoint.INF) {
                return other;
            }
            if (other == ModPoint.INF) {
                return this;
            }

            // Case 2: The points are vertically symmetric -> return infinity
            if (this._x.eq(other._x) && this._y.eq(other._y.negate())) {
                return ModPoint.INF;
            }

            var num, denom;
            if (this.eq(other)) {
                // Case 3: The points are equal -> double the current point
                num = this._x.pow(2).mulNum(3).add(this._curve.a);
                denom = this._y.mulNum(2);
            } else {
                // Case 4: Add the two points
                num = other._y.sub(this._y);
                denom = other._x.sub(this._x);
            }

            var lambda = num.div(denom);

            var x = lambda.pow(2).sub(this._x).sub(other._x);
            var y = lambda.mul(this._x.sub(x)).sub(this._y);

            return ModPoint.fromModNumbers(x, y, this._curve);
        };

        ModPoint.prototype.beginAdd = function (other) {
            // Case 1: One of the points is infinity -> return the other
            if (this == ModPoint.INF) {
                return ModPointAddPartialResult.fromResult(other);
            }
            if (other == ModPoint.INF) {
                return ModPointAddPartialResult.fromResult(this);
            }

            // Case 2: The points are vertically symmetric -> return infinity
            if (this._x.eq(other._x) && this._y.eq(other._y.negate())) {
                return ModPointAddPartialResult.fromResult(ModPoint.INF);
            }

            var num, denom;
            if (this.eq(other)) {
                // Case 3: The points are equal -> double the current point
                num = this._x.pow(2).mulNum(3).add(this._curve.a);
                denom = this._y.mulNum(2);
            } else {
                // Case 4: Add the two points
                num = other._y.sub(this._y);
                denom = other._x.sub(this._x);
            }

            return ModPointAddPartialResult.fromDivision(num, denom);
        };

        ModPoint.prototype.endAdd = function (other, lambda) {
            var x = lambda.pow(2).sub(this._x).sub(other._x);
            var y = lambda.mul(this._x.sub(x)).sub(this._y);

            return ModPoint.fromModNumbers(x, y, this._curve);
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
            return this._x.value.mod(BigInteger.fromInt(n)).toInt();
        };

        /** O(min(this.x.value.digits, other.x.value.digits) + min(this.y.value.digits, other.y.value.digits)) */
        ModPoint.prototype.eq = function (other) {
            if (this == ModPoint.INF) {
                return other == ModPoint.INF;
            }
            if (other == ModPoint.INF) {
                return false;
            }

            return this._x.eq(other._x) && this._y.eq(other._y);
        };

        /** O(this.x.value.digits + this.y.value.digits) */
        ModPoint.prototype.toString = function () {
            if (this == ModPoint.INF) {
                return "Infinity";
            }
            return "(" + this._x.value.toString() + ", " + this._y.value.toString() + ")";
        };

        ModPoint.fromModNumbers = function (x, y, curve) {
            var point = new ModPoint();
            point._x = x;
            point._y = y;
            point._curve = curve;
            return point;
        };
        ModPoint.INF = new ModPoint();
        return ModPoint;
    })();

    
    return ModPoint;
});
//# sourceMappingURL=ModPoint.js.map
