define(["require", "exports", "BigInteger", "ModPoint", "AdditionTable", "Server"], function(require, exports, BigInteger, ModPoint, Addition, Server) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function run(gx, gy, hx, hy, config) {
            var generator = new ModPoint(gx, gy, config.Curve);
            var target = new ModPoint(hx, hy, config.Curve);
            var table = new Addition.Table(generator, target, config);

            var walks = Array();

            for (var n = 0; n < config.ParrallelWalksCount; n++) {
                walks[n] = new CurveWalk(table);
            }

            console.clear();

            for (var step = BigInteger.Zero; step.lt(config.Curve.N); step = step.add(BigInteger.One)) {
                var N = config.ParrallelWalksCount;

                var x = Array(N);

                for (var n = 0; n < N; n++) {
                    x[n] = walks[n].beginStep();
                }

                var a = Array(N);
                a[0] = x[0].Denominator;
                for (var n = 1; n < N; n++) {
                    a[n] = a[n - 1].mul(x[n].Denominator);
                }

                var xinv = Array();
                var ainv = Array();
                ainv[N - 1] = a[N - 1].invert();
                for (var n = N - 1; n > 0; n--) {
                    xinv[n] = ainv[n].mul(a[n - 1]);
                    ainv[n - 1] = ainv[n].mul(x[n].Denominator);
                }
                xinv[0] = ainv[0];

                for (var n = 0; n < config.ParrallelWalksCount; n++) {
                    var lambda = x[n].Numerator.mul(xinv[n]);

                    walks[n].endStep(lambda);

                    if (isDistinguished(walks[n].Current, config)) {
                        Server.send(walks[n].U, walks[n].V, walks[n].Current);
                    }
                }
            }
        }
        PollardRho.run = run;

        function isDistinguished(point, config) {
            return (point.X.Value.and(config.DistinguishedPointMask)).eq(config.DistinguishedPointMask);
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

            CurveWalk.prototype.beginStep = function () {
                var index = this.current.partition(this.table.Length);
                this.currentEntry = this.table.at(index);
                this.u = this.u.add(this.currentEntry.U);
                this.v = this.v.add(this.currentEntry.V);
                return this.current.beginAdd(this.currentEntry.P);
            };

            CurveWalk.prototype.endStep = function (lambda) {
                this.current = this.current.endAdd(this.currentEntry.P, lambda);
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
