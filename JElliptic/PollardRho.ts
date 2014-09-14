import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import Config = require("Config");

module PollardRho {
    // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
    export function solve(gx: number, gy: number, hx: number, hy: number, config: Config): number {
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

    // Generate a random table according to the config
    function getAddingTable(generator: ModPoint, config: Config): ModPoint[] {
        setRandomSeed(config.AdditionTableSeed);
        var table = new Array<ModPoint>(config.AdditionTableLength);
        for (var n = 0; n < table.length; n++) {
            var multiplier = new ModNumber(Math.round(Math.random() * (table.length - 1)), config.Curve.N);
            table[n] = generator.mul(multiplier);
            console.log("table[" + n + "] = " + table[n]);
        }
        return table;
    }

    // Very simple seeded RNG, from http://stackoverflow.com/a/23304189
    function setRandomSeed(seed: number): void {
        Math.random = function () {
            seed = Math.sin(seed) * 10000;
            return seed - Math.floor(seed);
        };
    };

    // Walk over a problem.
    class CurveWalk {
        private generator: ModPoint;
        private target: ModPoint;
        private table: ModPoint[];

        private a: ModNumber;
        private b: ModNumber;
        private current: ModPoint;


        constructor(generator: ModPoint, target: ModPoint, table: ModPoint[], a?: ModNumber, b?: ModNumber) {
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


        get A(): ModNumber {
            return this.a;
        }

        get B(): ModNumber {
            return this.b;
        }

        get Current(): ModPoint {
            return this.current;
        }


        step(): CurveWalk {
            var index = this.current.partition(this.table.length);
            var point = this.table[index];
            return this.cloneWith(this.a.addNum(point.X.Value), this.b.addNum(point.Y.Value));
        }


        toString(): string {
            return "[" + this.a.Value + "·" + this.generator + " + " + this.b.Value + "·" + this.target + " = " + this.current + "]";
        }


        private cloneWith(a: ModNumber, b: ModNumber): CurveWalk {
            return new CurveWalk(this.generator, this.target, this.table, a, b);
        }
    }
}

export = PollardRho;