define(["require", "exports", "ModPoint", "ModCurve"], function(require, exports, ModPoint, ModCurve) {
    var DiscreteLogProblem = (function () {
        function DiscreteLogProblem(gx, gy, hx, hy, a, b, n) {
            this.curve = new ModCurve(a, b, n);
            this.generator = new ModPoint(gx, gy, this.curve);
            this.target = new ModPoint(hx, hy, this.curve);
        }
        Object.defineProperty(DiscreteLogProblem.prototype, "Generator", {
            get: function () {
                return this.generator;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DiscreteLogProblem.prototype, "Target", {
            get: function () {
                return this.target;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DiscreteLogProblem.prototype, "Curve", {
            get: function () {
                return this.curve;
            },
            enumerable: true,
            configurable: true
        });
        return DiscreteLogProblem;
    })();

    
    return DiscreteLogProblem;
});
//# sourceMappingURL=DiscreteLogProblem.js.map
