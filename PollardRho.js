define(["require", "exports", "BigInteger", "ModPoint", "AdditionTable", "Server"], function(require, exports, BigInteger, ModPoint, Addition, Server) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function run(gx, gy, hx, hy, config) {
            var generator = new ModPoint(gx, gy, config.curve);
            var target = new ModPoint(hx, hy, config.curve);
            var table = new Addition.Table(generator, target, config);

            var walks = Array();

            for (var n = 0; n < config.parrallelWalksCount; n++) {
                walks[n] = new CurveWalk(table);
            }

            console.clear();

            for (var step = BigInteger.ZERO; step.lt(config.curve.n); step = step.add(BigInteger.ONE)) {
                var N = config.parrallelWalksCount;

                var x = Array(N);

                for (var n = 0; n < N; n++) {
                    x[n] = walks[n].beginStep();
                }

                var a = Array(N);
                a[0] = x[0].denominator;
                for (var n = 1; n < N; n++) {
                    a[n] = a[n - 1].mul(x[n].denominator);
                }

                var xinv = Array();
                var ainv = Array();
                ainv[N - 1] = a[N - 1].invert();
                for (var n = N - 1; n > 0; n--) {
                    xinv[n] = ainv[n].mul(a[n - 1]);
                    ainv[n - 1] = ainv[n].mul(x[n].denominator);
                }
                xinv[0] = ainv[0];

                for (var n = 0; n < config.parrallelWalksCount; n++) {
                    var lambda = x[n].numerator.mul(xinv[n]);

                    walks[n].endStep(lambda);

                    if (isDistinguished(walks[n].current, config)) {
                        Server.send(walks[n].u, walks[n].v, walks[n].current);
                    }
                }
            }
        }
        PollardRho.run = run;

        function isDistinguished(point, config) {
            return (point.x.value.and(config.distinguishedPointMask)).eq(config.distinguishedPointMask);
        }

        // Walk over a problem.
        var CurveWalk = (function () {
            function CurveWalk(table) {
                this._table = table;

                var entry = table.at(0);
                this._u = entry.u;
                this._v = entry.v;
                this._current = entry.p;
            }
            Object.defineProperty(CurveWalk.prototype, "u", {
                get: function () {
                    return this._u;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CurveWalk.prototype, "v", {
                get: function () {
                    return this._v;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CurveWalk.prototype, "current", {
                get: function () {
                    return this._current;
                },
                enumerable: true,
                configurable: true
            });

            CurveWalk.prototype.beginStep = function () {
                var index = this._current.partition(this._table.length);
                this._currentEntry = this._table.at(index);
                this._u = this._u.add(this._currentEntry.u);
                this._v = this._v.add(this._currentEntry.v);
                return this._current.beginAdd(this._currentEntry.p);
            };

            CurveWalk.prototype.endStep = function (lambda) {
                this._current = this._current.endAdd(this._currentEntry.p, lambda);
            };

            CurveWalk.prototype.toString = function () {
                return "[u = " + this._u + ", v = " + this._v + "]";
            };
            return CurveWalk;
        })();
    })(PollardRho || (PollardRho = {}));

    
    return PollardRho;
});
//# sourceMappingURL=PollardRho.js.map
