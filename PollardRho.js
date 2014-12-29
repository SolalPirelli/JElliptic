define(["require", "exports", "ModPoint", "ModPointSet", "AdditionTable"], function(require, exports, ModPoint, ModPointSet, Addition) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function run(config, resultSink) {
            var table = new Addition.Table(config);

            var walk = config.parrallelWalksCount == 1 ? new SingleCurveWalk(config, table) : new MultiCurveWalk(config, table);

            while (true) {
                for (var n = 0; n < config.checkCyclePeriod; n++) {
                    walk.step();
                    walk.send(resultSink);
                }

                var encountered = new ModPointSet();
                for (var n = 0; n < config.checkCycleLength; n++) {
                    walk.step();
                    walk.send(resultSink);

                    if (!walk.addTo(encountered)) {
                        walk.escape();
                        break;
                    }
                }
            }
        }
        PollardRho.run = run;

        // For tests, a version of run that finishes after a little while, and continuously checks for cycles
        function runLimited(config, resultSink) {
            var table = new Addition.Table(config);

            var walk = config.parrallelWalksCount == 1 ? new SingleCurveWalk(config, table) : new MultiCurveWalk(config, table);

            for (var x = 0; x < 100; x++) {
                for (var n = 0; n < config.checkCyclePeriod; n++) {
                    walk.step();
                    walk.send(resultSink);
                }

                var encountered = new ModPointSet();
                for (var n = 0; n < config.checkCycleLength; n++) {
                    walk.step();
                    walk.send(resultSink);

                    if (!walk.addTo(encountered)) {
                        walk.escape();
                        break;
                    }
                }
            }
        }
        PollardRho.runLimited = runLimited;

        var SingleCurveWalk = (function () {
            function SingleCurveWalk(config, table) {
                this._config = config;
                this._table = table;

                this._index = SingleCurveWalk.INDEX;
                var entry = this._table.at(this._index % this._table.length);
                this._u = entry.u;
                this._v = entry.v;
                this._current = entry.p;

                if (config.computePointsUniqueFraction) {
                    this._allPoints = new ModPointSet();
                }

                SingleCurveWalk.INDEX++;
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
                var entry = this._table.at(index);

                var candidate = this._current.add(entry.p);
                this.setCurrent(candidate, entry.u, entry.v);
            };

            SingleCurveWalk.prototype.addTo = function (pointSet) {
                return pointSet.add(this._current);
            };

            SingleCurveWalk.prototype.escape = function () {
                this.setCurrent(this._current.add(this._current), this._u, this._v);
            };

            SingleCurveWalk.prototype.send = function (sink) {
                if (this._current != ModPoint.INFINITY && (this._current.x.value.and(this._config.distinguishedPointMask)).compare(this._config.distinguishedPointMask) == 0) {
                    sink.send(this._u, this._v, this._current);

                    if (this._config.computePointsUniqueFraction) {
                        console.log("% of unique points for walk " + this._index + ": " + (this._allPoints.uniqueFraction * 100.0));
                    }
                }
            };

            /** If the result can already be computed, returns null; endStep must then not be called. */
            SingleCurveWalk.prototype.beginStep = function () {
                var index = this._current.partition(this._table.length);
                var entry = this._table.at(index);

                var partialResult = this._current.beginAdd(entry.p);
                if (partialResult.result == undefined) {
                    return partialResult;
                }
                this.setCurrent(partialResult.result, entry.u, entry.v);
                return null;
            };

            SingleCurveWalk.prototype.endStep = function (lambda) {
                var index = this._current.partition(this._table.length);
                var entry = this._table.at(index);
                this.setCurrent(this._current.endAdd(entry.p, lambda), entry.u, entry.v);
            };

            SingleCurveWalk.prototype.setCurrent = function (candidate, u, v) {
                var reflected = candidate.negate();

                this._u = this._u.add(u);
                this._v = this._v.add(v);

                if (candidate.compareY(reflected) == -1) {
                    // take the smallest y
                    candidate = reflected;
                    this._u = this._u.negate();
                    this._v = this._v.negate();
                }

                if (this._config.computePointsUniqueFraction) {
                    this._allPoints.add(candidate);
                }
                this._current = candidate;
            };
            SingleCurveWalk.INDEX = 0;
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
                var x = Array();
                var unfinishedWalks = new Array();

                for (var n = 0; n < this._walks.length; n++) {
                    var result = this._walks[n].beginStep();
                    if (result != null) {
                        x.push(result);
                        unfinishedWalks.push(this._walks[n]);
                    }
                }

                if (unfinishedWalks.length != 0) {
                    var a = Array();
                    a[0] = x[0].denominator;
                    for (var n = 1; n < unfinishedWalks.length; n++) {
                        a[n] = a[n - 1].mul(x[n].denominator);
                    }

                    var xinv = Array(a.length);
                    var ainv = Array(a.length);
                    ainv[a.length - 1] = a[a.length - 1].invert();
                    for (var n = unfinishedWalks.length - 1; n > 0; n--) {
                        xinv[n] = ainv[n].mul(a[n - 1]);
                        ainv[n - 1] = ainv[n].mul(x[n].denominator);
                    }
                    xinv[0] = ainv[0];

                    for (var n = 0; n < unfinishedWalks.length; n++) {
                        var lambda = x[n].numerator.mul(xinv[n]);
                        unfinishedWalks[n].endStep(lambda);
                    }
                }
            };

            MultiCurveWalk.prototype.addTo = function (pointSet) {
                for (var n = 0; n < this._walks.length; n++) {
                    if (!this._walks[n].addTo(pointSet)) {
                        return false;
                    }
                }
                return true;
            };

            MultiCurveWalk.prototype.escape = function () {
                this._walks.forEach(function (w) {
                    return w.escape();
                });
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
