define(["require", "exports", "ModNumber", "ModPoint"], function(require, exports, ModNumber, ModPoint) {
    var PollardRho;
    (function (PollardRho) {
        // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
        // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
        function solve(gx, gy, hx, hy, config) {
            var generator = new ModPoint(gx, gy, config.Curve);
            var target = new ModPoint(hx, hy, config.Curve);
            var table = getAddingTable(generator, config);

            var tortoise = new CurveWalk(generator, target, table);
            var hare = new CurveWalk(generator, target, table);

            console.clear();

            for (var step = 0; step < config.Curve.N; step++) {
                tortoise = tortoise.step();

                hare = hare.step().step();

                console.log("Step " + step);
                console.log("Tortoise: " + tortoise);
                console.log("Hare    : " + hare);
                console.log(" ");

                if (tortoise.Current.eq(hare.Current) && !tortoise.B.eq(hare.B)) {
                    var log = tortoise.A.sub(hare.A).div(hare.B.sub(tortoise.B));

                    var actualTarget = generator.mul(log);
                    if (!target.eq(actualTarget)) {
                        throw "Incorrect result found. (" + log + ")";
                    }

                    return log.Value;
                }
            }
            throw "No result found.";
        }
        PollardRho.solve = solve;

        // Generate a random table according to the config
        function getAddingTable(generator, config) {
            setRandomSeed(config.AdditionTableSeed);
            var table = new Array(config.AdditionTableLength);
            for (var n = 0; n < table.length; n++) {
                var multiplier = new ModNumber(Math.round(Math.random() * (table.length - 1)), config.Curve.N);
                table[n] = generator.mul(multiplier);
                console.log("table[" + n + "] = " + table[n]);
            }
            return table;
        }

        // Very simple seeded RNG, from http://stackoverflow.com/a/23304189
        function setRandomSeed(seed) {
            Math.random = function () {
                seed = Math.sin(seed) * 10000;
                return seed - Math.floor(seed);
            };
        }
        ;

        // Walk over a problem.
        var CurveWalk = (function () {
            function CurveWalk(generator, target, table, a, b) {
                var order = generator.getOrder();

                a = a || new ModNumber(0, order);
                b = b || new ModNumber(0, order);

                this.generator = generator;
                this.target = target;
                this.table = table;
                this.a = a;
                this.b = b;
                this.current = generator.mul(a).add(target.mul(b));
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
                var index = this.current.partition(this.table.length);
                var point = this.table[index];
                return this.cloneWith(this.a.addNum(point.X.Value), this.b.addNum(point.Y.Value));
            };

            CurveWalk.prototype.toString = function () {
                return "[" + this.a.Value + "·" + this.generator + " + " + this.b.Value + "·" + this.target + " = " + this.current + "]";
            };

            CurveWalk.prototype.cloneWith = function (a, b) {
                return new CurveWalk(this.generator, this.target, this.table, a, b);
            };
            return CurveWalk;
        })();
    })(PollardRho || (PollardRho = {}));

    
    return PollardRho;
});
//# sourceMappingURL=PollardRho.js.map
