define(["require", "exports", "BigInteger", "ModPoint", "AdditionTable"], function(require, exports, BigInteger, ModPoint, Addition) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function run(config, resultSink) {
            var table = new Addition.Table(config);

            if (config.parrallelWalksCount == 1) {
                runOneWalk(config, resultSink, table);
            } else {
                runMultipleWalks(config, resultSink, table);
            }
        }
        PollardRho.run = run;

        function runOneWalk(config, resultSink, table) {
            var walk = new CurveWalk(table);

            for (var step = BigInteger.ZERO; step.lt(config.curve.n); step = step.add(BigInteger.ONE)) {
                walk.fullStep();

                if (isDistinguished(walk.current, config)) {
                    resultSink.send(walk.u, walk.v, walk.current);
                }
            }
        }

        function runMultipleWalks(config, resultSink, table) {
            var walks = Array();

            for (var n = 0; n < config.parrallelWalksCount; n++) {
                walks[n] = new CurveWalk(table);
            }

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
                        resultSink.send(walks[n].u, walks[n].v, walks[n].current);
                    }
                }
            }
        }

        function isDistinguished(point, config) {
            return point != ModPoint.INFINITY && (point.x.value.and(config.distinguishedPointMask)).eq(config.distinguishedPointMask);
        }

        // Walk over a problem.
        var CurveWalk = (function () {
            function CurveWalk(table) {
                this._table = table;

                // TODO the starting entry needs to be random, of course
                var entry = this._table.at(0);
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

            CurveWalk.prototype.fullStep = function () {
                var index = this._current.partition(this._table.length);
                this._currentEntry = this._table.at(index);
                this._u = this._u.add(this._currentEntry.u);
                this._v = this._v.add(this._currentEntry.v);
                this._current = this._current.add(this._currentEntry.p);
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
