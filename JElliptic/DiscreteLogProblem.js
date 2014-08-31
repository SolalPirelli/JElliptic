define(["require", "exports", "ModNumber", "ModPoint", "ModCurve"], function(require, exports, ModNumber, ModPoint, ModCurve) {
    var CurveWalk = (function () {
        function CurveWalk(problem, u, v) {
            u = u || new ModNumber(1, problem.Curve.N);
            v = v || new ModNumber(1, problem.Curve.N);

            this.problem = problem;
            this.u = u;
            this.v = v;
            this.current = problem.Generator.mul(u).add(problem.Target.mul(v));
        }
        Object.defineProperty(CurveWalk.prototype, "U", {
            get: function () {
                return this.u;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(CurveWalk.prototype, "V", {
            get: function () {
                return this.v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(CurveWalk.prototype, "Current", {
            get: function () {
                return this.current;
            },
            enumerable: true,
            configurable: true
        });

        CurveWalk.prototype.step = function () {
            var u, v;
            switch (this.current.partition(3)) {
                case 0:
                    u = this.u.mulNum(2);
                    v = this.v.mulNum(2);
                    break;

                case 1:
                    u = this.u.addNum(1);
                    v = this.v;
                    break;

                case 2:
                    u = this.u;
                    v = this.v.addNum(1);
                    break;
            }

            return new CurveWalk(this.problem, u, v);
        };

        CurveWalk.prototype.eq = function (other) {
            return this.v.eq(other.v) && this.u.eq(other.u);
        };

        CurveWalk.prototype.toString = function () {
            return "[" + this.u.Value + "·" + this.problem.Generator + " + " + this.v.Value + "·" + this.problem.Target + " = " + this.current + " on " + this.problem.Curve + "]";
        };
        return CurveWalk;
    })();

    var DiscreteLogProblem = (function () {
        function DiscreteLogProblem(gx, gy, hx, hy, a, b, n) {
            this.curve = new ModCurve(a, b, n);
            this.generator = ModPoint.create(gx, gy, this.curve);
            this.target = ModPoint.create(hx, hy, this.curve);
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

        DiscreteLogProblem.prototype.solve = function () {
            var tortoise = new CurveWalk(this);
            var hare = new CurveWalk(this);

            for (var step = 1; step < this.curve.N; step++) {
                tortoise = tortoise.step();

                hare = hare.step().step();

                console.log("Step: " + step);
                console.log("Tortoise: " + tortoise);
                console.log("Hare: " + hare);
                console.log("---");

                if (tortoise.Current.eq(hare.Current) && !tortoise.eq(hare)) {
                    return tortoise.U.sub(hare.U).div(hare.V.sub(tortoise.V)).Value;
                }
            }
        };
        return DiscreteLogProblem;
    })();

    
    return DiscreteLogProblem;
});
//# sourceMappingURL=DiscreteLogProblem.js.map
