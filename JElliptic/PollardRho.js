define(["require", "exports", "BigInteger", "ModPoint", "AdditionTable", "Server"], function(require, exports, BigInteger, ModPoint, Addition, Server) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function solve(gx, gy, hx, hy, config) {
            var generator = new ModPoint(gx, gy, config.Curve);
            var target = new ModPoint(hx, hy, config.Curve);

            var table = new Addition.Table(generator, target, config);

            var walk = new CurveWalk(table);

            console.clear();

            for (var step = BigInteger.Zero; step.lt(config.Curve.N); step = step.add(BigInteger.One)) {
                walk.step();

                if (isDistinguished(walk.Current, config)) {
                    Server.send(walk.U, walk.V, walk.Current);
                }
            }
        }
        PollardRho.solve = solve;

        function isDistinguished(point, config) {
            return (point.X.Value.and(config.DistinguishedPointMask)).eq(BigInteger.Zero);
        }

        // Walk over a problem. (mutable)
        var CurveWalk = (function () {
            function CurveWalk(table) {
                this.table = table;

                var entry = table.at(0);
                this.u = entry.U;
                this.v = entry.V;
                this.current = entry.P;
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
                this.u = this.u.add(entry.U);
                this.v = this.v.add(entry.V);
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
