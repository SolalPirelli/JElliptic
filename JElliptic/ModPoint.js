define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var ModPoint = (function () {
        function ModPoint(x, y, curve) {
            if (curve == null) {
                return;
            }

            this.x = new ModNumber(x, curve.N);
            this.y = new ModNumber(y, curve.N);
            this.curve = curve;

            this.ensureValid();
        }
        Object.defineProperty(ModPoint.prototype, "X", {
            get: function () {
                return this.x;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPoint.prototype, "Y", {
            get: function () {
                return this.y;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPoint.prototype, "Curve", {
            get: function () {
                return this.curve;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPoint, "Infinity", {
            get: function () {
                return ModPoint.INFINITY;
            },
            enumerable: true,
            configurable: true
        });

        ModPoint.prototype.add = function (other) {
            // Case 1: One of the points is infinity -> return the other
            if (this == ModPoint.INFINITY) {
                return other;
            }
            if (other == ModPoint.INFINITY) {
                return this;
            }

            // Case 2: The points are vertically symmetric -> return infinity
            if (this.x.eq(other.x) && this.y.eq(other.y.negate())) {
                return ModPoint.INFINITY;
            }

            var lambda;
            if (this.eq(other)) {
                // Case 3: The points are equal -> double the current point
                var num = this.x.pow(2).mulNum(3).add(this.curve.A);
                var denom = this.y.mulNum(2);
                lambda = num.div(denom);
            } else {
                // Case 4: Add the two points
                var num = other.y.sub(this.y);
                var denom = other.x.sub(this.x);
                lambda = num.div(denom);
            }

            var x = lambda.pow(2).sub(this.x).sub(other.x);
            var y = lambda.mul(this.x.sub(x)).sub(this.y);

            return new ModPoint(x.Value, y.Value, this.curve);
        };

        ModPoint.prototype.mulNum = function (n) {
            var g = ModPoint.INFINITY;
            for (var _ = 0; _ < n; _++) {
                g = g.add(this);
            }
            return g;
        };

        ModPoint.prototype.partition = function (count) {
            if (this == ModPoint.INFINITY) {
                return 0;
            }
            return this.x.Value % count;
        };

        ModPoint.prototype.getOrder = function () {
            var point = ModPoint.INFINITY;
            for (var order = 1; ; order++) {
                point = point.add(this);
                if (point.eq(ModPoint.INFINITY)) {
                    return order;
                }
            }

            throw "No order found.";
        };

        ModPoint.prototype.eq = function (other) {
            if (this == ModPoint.INFINITY) {
                return other == ModPoint.INFINITY;
            }
            if (other == ModPoint.INFINITY) {
                return false;
            }

            return this.x.eq(other.x) && this.y.eq(other.y);
        };

        ModPoint.prototype.toString = function () {
            if (this == ModPoint.INFINITY) {
                return "Infinity";
            }
            return "(" + this.x.Value + ", " + this.y.Value + ")";
        };

        ModPoint.prototype.ensureValid = function () {
            if (!this.y.pow(2).eq(this.x.pow(3).add(this.curve.A.mul(this.x)).add(this.curve.B))) {
                throw (this + " is not a valid point.");
            }
        };
        ModPoint.INFINITY = new ModPoint(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, null);
        return ModPoint;
    })();

    
    return ModPoint;
});
//# sourceMappingURL=ModPoint.js.map
