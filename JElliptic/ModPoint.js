define(["require", "exports", "BigInteger", "ModNumber", "ModPointAddPartialResult"], function(require, exports, BigInteger, ModNumber, ModPointAddPartialResult) {
    var ModPoint = (function () {
        function ModPoint(x, y, curve) {
            if (curve == null) {
                return;
            }

            this._x = new ModNumber(x, curve.n);
            this._y = new ModNumber(y, curve.n);
            this._curve = curve;

            this.ensureValid();
        }
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

            return new ModPoint(x.value, y.value, this._curve);
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

            return new ModPoint(x.value, y.value, this._curve);
        };

        ModPoint.prototype.mulNum = function (n) {
            var g = ModPoint.INF;
            for (var _ = BigInteger.ZERO; _.lt(n); _ = _.add(BigInteger.ONE)) {
                g = g.add(this);
            }
            return g;
        };

        ModPoint.prototype.partition = function (count) {
            if (this == ModPoint.INF) {
                return 0;
            }
            return this._x.value.mod(BigInteger.fromInt(count)).toInt();
        };

        ModPoint.prototype.getOrder = function () {
            var point = ModPoint.INF;
            for (var order = 1; ; order++) {
                point = point.add(this);
                if (point.eq(ModPoint.INF)) {
                    return order;
                }
            }

            throw "No order found.";
        };

        ModPoint.prototype.eq = function (other) {
            if (this == ModPoint.INF) {
                return other == ModPoint.INF;
            }
            if (other == ModPoint.INF) {
                return false;
            }

            return this._x.eq(other._x) && this._y.eq(other._y);
        };

        ModPoint.prototype.toString = function () {
            if (this == ModPoint.INF) {
                return "Infinity";
            }
            return "(" + this._x.value + ", " + this._y.value + ")";
        };

        ModPoint.prototype.ensureValid = function () {
            if (!this._y.pow(2).eq(this._x.pow(3).add(this._curve.a.mul(this._x)).add(this._curve.b))) {
                throw (this + " is not a valid point.");
            }
        };
        ModPoint.INF = new ModPoint(BigInteger.ZERO, BigInteger.ZERO, null);
        return ModPoint;
    })();

    
    return ModPoint;
});
//# sourceMappingURL=ModPoint.js.map
