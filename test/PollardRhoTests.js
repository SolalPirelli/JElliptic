/// <reference path="lib/qunit.d.ts" />
define(["require", "exports", "BigInteger", "ModNumber", "ModPoint", "ModCurve", "PollardRho"], function(require, exports, BigInteger, ModNumber, ModPoint, ModCurve, PollardRho) {
    var PollardRhoTests;
    (function (PollardRhoTests) {
        var NonAlgorithmicConfig = (function () {
            function NonAlgorithmicConfig(a, b, n, order, gx, gy, tx, ty, expected) {
                this.a = a;
                this.b = b;
                this.n = n;
                this.order = order;
                this.gx = gx;
                this.gy = gy;
                this.tx = tx;
                this.ty = ty;
                this.expected = expected;
            }
            return NonAlgorithmicConfig;
        })();

        var Result = (function () {
            function Result(u, v, p) {
                this.u = u;
                this.v = v;
                this.p = p;
            }
            return Result;
        })();

        var StoreResultSink = (function () {
            function StoreResultSink() {
            }
            StoreResultSink.prototype.send = function (u, v, p) {
                this.results.push(new Result(u, v, p));
            };
            return StoreResultSink;
        })();

        var ComputingResultSink = (function () {
            function ComputingResultSink() {
                // This class is a massive hack, but we're testing with small numbers, so it'll work
                this._map = {};
                this.result = null;
            }
            ComputingResultSink.prototype.send = function (u, v, p) {
                var ps = p.toString();
                if (this._map[ps] == undefined) {
                    this._map[ps] = new Result(u, v, p);
                } else {
                    var existingResult = this._map[ps];
                    if (!existingResult.v.eq(v)) {
                        this.result = u.sub(existingResult.u).div(existingResult.v.sub(v));
                    }
                }
            };
            return ComputingResultSink;
        })();

        function exactSteps(name, config) {
            var expected = [];
            for (var _i = 0; _i < (arguments.length - 2); _i++) {
                expected[_i] = arguments[_i + 2];
            }
            test(name, function () {
                var sink = new StoreResultSink();
                PollardRho.run(config, sink);

                equal(sink.results, expected);
            });
        }

        function result(configName, points, tableSeed, tableLength, walksCount, useNegationMap, distinguishedMask) {
            var sink = new ComputingResultSink();
            var curve = new ModCurve(BigInteger.parse(points.a), BigInteger.parse(points.b), BigInteger.parse(points.n), BigInteger.parse(points.order));
            var config = {
                curve: curve,
                generator: ModPoint.create(BigInteger.parse(points.gx), BigInteger.parse(points.gy), curve),
                target: ModPoint.create(BigInteger.parse(points.tx), BigInteger.parse(points.ty), curve),
                additionTableSeed: tableSeed,
                additionTableLength: tableLength,
                parrallelWalksCount: walksCount,
                useNegationMap: useNegationMap,
                distinguishedPointMask: BigInteger.parse(distinguishedMask)
            };

            test(configName + ": " + points.expected + " * " + config.generator + " = " + config.target + " on " + config.curve, function () {
                PollardRho.run(config, sink);
                ok(sink.result.eq(new ModNumber(BigInteger.parse(points.expected), curve.order)));
            });
        }

        function run() {
            QUnit.module("PollardRho");

            var correctResults = [
                new NonAlgorithmicConfig("0", "3", "31", "31", "11", "1", "23", "24", "10")
            ];

            correctResults.forEach(function (r) {
                return result("1 walk", r, 0, 64, 1, true, "1");
            });
            correctResults.forEach(function (r) {
                return result("2 walks", r, 0, 64, 2, true, "1");
            });
        }
        PollardRhoTests.run = run;
    })(PollardRhoTests || (PollardRhoTests = {}));

    
    return PollardRhoTests;
});
//# sourceMappingURL=PollardRhoTests.js.map
