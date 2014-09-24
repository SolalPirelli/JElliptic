import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import Config = require("Config");
import Addition = require("AdditionTable");
import Server = require("Server");

module PollardRho {
    // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
    export function run(gx: BigInteger, gy: BigInteger, hx: BigInteger, hy: BigInteger, config: Config): void {
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

    function isDistinguished(point: ModPoint, config: Config): boolean {
        return (point.X.Value.and(config.DistinguishedPointMask)).eq(BigInteger.Zero);
    }

    // Walk over a problem. (mutable)
    class CurveWalk {
        private table: Addition.Table;

        private u: ModNumber;
        private v: ModNumber;
        private current: ModPoint;


        constructor(table: Addition.Table) {
            this.table = table;

            var entry = table.at(0);
            this.u = entry.U;
            this.v = entry.V;
            this.current = entry.P;
        }


        get U(): ModNumber {
            return this.u;
        }

        get V(): ModNumber {
            return this.v;
        }

        get Current(): ModPoint {
            return this.current;
        }


        step(): void {
            var index = this.current.partition(this.table.Length);
            var entry = this.table.at(index);
            this.u = this.u.add(entry.U);
            this.v = this.v.add(entry.V);
            this.current = this.current.add(entry.P);
        }


        toString(): string {
            return "[u = " + this.u + ", v = " + this.v + "]";
        }
    }
}

export = PollardRho;