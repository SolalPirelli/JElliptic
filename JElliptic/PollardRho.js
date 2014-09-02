define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        function solve(problem) {
            var tortoise = new CurveWalk(problem);
            var hare = new CurveWalk(problem);

            console.clear();

            for (var step = 0; step < problem.Curve.N; step++) {
                tortoise = tortoise.step();

                hare = hare.step().step();

                console.log("Step " + step);
                console.log("Tortoise: " + tortoise);
                console.log("Hare    : " + hare);
                console.log(" ");

                if (tortoise.Current.eq(hare.Current) && !tortoise.B.eq(hare.B)) {
                    var log = tortoise.A.sub(hare.A).div(hare.B.sub(tortoise.B));
                    var actualTarget = problem.Generator.mul(log);

                    if (!problem.Target.eq(actualTarget)) {
                        throw "Incorrect result found. (" + log + ")";
                    }

                    return log.Value;
                }
            }
            throw "No result found.";
        }
        PollardRho.solve = solve;

        var CurveWalk = (function () {
            function CurveWalk(problem, a, b) {
                a = a || new ModNumber(0, problem.Curve.N);
                b = b || new ModNumber(0, problem.Curve.N);

                this.problem = problem;
                this.a = a;
                this.b = b;
                this.current = problem.Generator.mul(a).add(problem.Target.mul(b));
            }
            Object.defineProperty(CurveWalk.prototype, "A", {
                get: function () {
                    return this.a;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CurveWalk.prototype, "B", {
                get: function () {
                    return this.b;
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
                var a, b;
                switch (this.current.partition(3)) {
                    case 0:
                        a = this.a.addNum(1);
                        b = this.b;
                        break;

                    case 1:
                        a = this.a.mulNum(2);
                        b = this.b.mulNum(2);
                        break;

                    case 2:
                        a = this.a;
                        b = this.b.addNum(1);
                        break;
                }

                return new CurveWalk(this.problem, a, b);
            };

            CurveWalk.prototype.toString = function () {
                return "[" + this.a.Value + "·" + this.problem.Generator + " + " + this.b.Value + "·" + this.problem.Target + " = " + this.current + " on " + this.problem.Curve + "]";
            };
            return CurveWalk;
        })();
    })(PollardRho || (PollardRho = {}));

    
    return PollardRho;
});
//# sourceMappingURL=PollardRho.js.map
