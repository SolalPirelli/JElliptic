define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var ModPoint = (function () {
        function ModPoint() {
        }
        ModPoint.create = function (x, y, curve) {
            return ModPoint.createNum(new ModNumber(x, curve.N), new ModNumber(y, curve.N), curve);
        };

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

            return ModPoint.createNum(x, y, this.curve);
        };

        ModPoint.prototype.mul = function (n) {
            var g = ModPoint.INFINITY;
            for (var _ = 0; _ < n.Value; _++) {
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

        ModPoint.prototype.eq = function (other) {
            return this == other || (this.x.eq(other.x) && this.y.eq(other.y));
        };

        ModPoint.prototype.toString = function () {
            if (this == ModPoint.INFINITY) {
                return "Zero";
            }
            return "(" + this.x.Value + ", " + this.y.Value + ")";
        };

        ModPoint.createNum = function (x, y, curve) {
            var p = new ModPoint();
            p.x = x;
            p.y = y;
            p.curve = curve;

            if (!p.isInCurve(curve)) {
                throw (p + " is not a valid point.");
            }

            return p;
        };

        ModPoint.prototype.isInCurve = function (curve) {
            return this.y.pow(2).eq(this.x.pow(3).add(curve.A.mul(this.x)).add(curve.B));
        };
        ModPoint.INFINITY = new ModPoint();
        return ModPoint;
    })();

    
    return ModPoint;
});
//# sourceMappingURL=ModPoint.js.map
