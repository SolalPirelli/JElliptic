define(["require", "exports", "ModPoint", "AdditionTable"], function(require, exports, ModPoint, Addition) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function solve(gx, gy, hx, hy, config) {
            var generator = new ModPoint(gx, gy, config.Curve);
            var target = new ModPoint(hx, hy, config.Curve);

            var table = new Addition.Table(generator, target, config);

            var tortoise = new CurveWalk(table);
            var hare = new CurveWalk(table);

            console.clear();

            for (var step = 0; step < config.Curve.N; step++) {
                tortoise.step();

                hare.step();
                hare.step();

                console.log("Step " + step);
                console.log("Tortoise: " + tortoise);
                console.log("Hare    : " + hare);
                console.log(" ");

                if (tortoise.Current.eq(hare.Current)) {
                    return 0;
                }
            }
            throw "No result found.";
        }
        PollardRho.solve = solve;

        // Walk over a problem.
        var CurveWalk = (function () {
            function CurveWalk(table) {
                this.table = table;

                this.u = 0;
                this.v = 0;
                this.current = ModPoint.Infinity;
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
                var index = this.current.partition(this.table.Length);
                var entry = this.table.at(index);
                this.u += entry.U;
                this.v += entry.V;
                this.current = this.current.add(entry.P);
            };

            CurveWalk.prototype.toString = function () {
                return "[u = " + this.u + ", v = " + this.v + "]";
            };
            return CurveWalk;
        })();
    })(PollardRho || (PollardRho = {}));

    
    return PollardRho;
});
//# sourceMappingURL=PollardRho.js.map
