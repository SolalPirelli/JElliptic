define(["require", "exports", "BigInteger", "ModPoint", "AdditionTable"], function(require, exports, BigInteger, ModPoint, Addition) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function run(config, resultSink) {
            var table = new Addition.Table(config);

            var walk = config.parrallelWalksCount == 1 ? new SingleCurveWalk(config, table) : new MultiCurveWalk(config, table);

            for (var step = BigInteger.ZERO; step.compare(config.curve.n) == -1; step = step.add(BigInteger.ONE)) {
                walk.step();
                walk.send(resultSink);
            }
        }
        PollardRho.run = run;

        var SingleCurveWalk = (function () {
            function SingleCurveWalk(config, table) {
                this._config = config;
                this._table = table;

                // TODO the starting entry needs to be random, of course
                var entry = this._table.at(0);
                this._u = entry.u;
                this._v = entry.v;
                this._current = entry.p;
            }
            Object.defineProperty(SingleCurveWalk.prototype, "u", {
                get: function () {
                    return this._u;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(SingleCurveWalk.prototype, "v", {
                get: function () {
                    return this._v;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(SingleCurveWalk.prototype, "current", {
                get: function () {
                    return this._current;
                },
                enumerable: true,
                configurable: true
            });

            SingleCurveWalk.prototype.step = function () {
                var index = this._current.partition(this._table.length);
                this._currentEntry = this._table.at(index);
                this._u = this._u.add(this._currentEntry.u);
                this._v = this._v.add(this._currentEntry.v);
                this.setCurrent(this._current.add(this._currentEntry.p));
            };

            SingleCurveWalk.prototype.send = function (sink) {
                if (this._current != ModPoint.INFINITY && (this._current.x.value.and(this._config.distinguishedPointMask)).eq(this._config.distinguishedPointMask)) {
                    sink.send(this._u, this._v, this._current);
                }
            };

            // beginStep and endStep are used by the multi-walk
            SingleCurveWalk.prototype.beginStep = function () {
                var index = this._current.partition(this._table.length);
                this._currentEntry = this._table.at(index);
                this._u = this._u.add(this._currentEntry.u);
                this._v = this._v.add(this._currentEntry.v);
                return this._current.beginAdd(this._currentEntry.p);
            };

            SingleCurveWalk.prototype.endStep = function (lambda) {
                this.setCurrent(this._current.endAdd(this._currentEntry.p, lambda));
            };

            SingleCurveWalk.prototype.setCurrent = function (candidate) {
                if (this._config.useNegationMap) {
                    var candidateNeg = candidate.negate();
                    if (candidate.y.compare(candidateNeg.y) == 1) {
                        this._current = candidate;
                    } else {
                        this._current = candidateNeg;
                        this._u = this._u.negate();
                        this._v = this._v.negate();
                    }
                } else {
                    this._current = candidate;
                }
            };
            return SingleCurveWalk;
        })();
        PollardRho.SingleCurveWalk = SingleCurveWalk;

        var MultiCurveWalk = (function () {
            function MultiCurveWalk(config, table) {
                this._walks = Array(config.parrallelWalksCount);
                for (var n = 0; n < this._walks.length; n++) {
                    this._walks[n] = new SingleCurveWalk(config, table);
                }
            }
            MultiCurveWalk.prototype.step = function () {
                var N = this._walks.length;

                var x = Array(N);

                for (var n = 0; n < N; n++) {
                    x[n] = this._walks[n].beginStep();
                }

                var a = Array(N);
                a[0] = x[0].denominator;
                for (var n = 1; n < N; n++) {
                    a[n] = a[n - 1].mul(x[n].denominator);
                }

                var xinv = Array(N);
                var ainv = Array(N);
                ainv[N - 1] = a[N - 1].invert();
                for (var n = N - 1; n > 0; n--) {
                    xinv[n] = ainv[n].mul(a[n - 1]);
                    ainv[n - 1] = ainv[n].mul(x[n].denominator);
                }
                xinv[0] = ainv[0];

                for (var n = 0; n < this._walks.length; n++) {
                    var lambda = x[n].numerator.mul(xinv[n]);

                    this._walks[n].endStep(lambda);
                }
            };

            MultiCurveWalk.prototype.send = function (sink) {
                this._walks.forEach(function (w) {
                    return w.send(sink);
                });
            };
            return MultiCurveWalk;
        })();
        PollardRho.MultiCurveWalk = MultiCurveWalk;
    })(PollardRho || (PollardRho = {}));

    
    return PollardRho;
});
//# sourceMappingURL=PollardRho.js.map
