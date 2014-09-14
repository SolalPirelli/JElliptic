import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import Config = require("Config");
import Addition = require("AdditionTable");

module PollardRho {
    // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
    export function solve(gx: number, gy: number, hx: number, hy: number, config: Config): number {
        var generator = new ModPoint(gx, gy, config.Curve);
        var target = new ModPoint(hx, hy, config.Curve);

        var table = new Addition.Table(generator, target, config);

        var tortoise = new CurveWalk( table);
        var hare = new CurveWalk(table);

        console.clear();

        for (var step = 0; step < config.Curve.N; step++) {
            tortoise.step();

            hare.step();
            hare.step();

            console.log("Step " + step);
            console.log("Tortoise: " + tortoise);
            console.log("Hare    : " + hare);
            console.log(" ");

            if (tortoise.Current.eq(hare.Current)) {
                return 0; // TODO
            }
        }
        throw "No result found.";
    }

    // Walk over a problem.
    class CurveWalk {
        private table: Addition.Table;

        private u: number;
        private v: number;
        private current: ModPoint;


        constructor(table: Addition.Table) {
            this.table = table;

            this.u = 0;
            this.v = 0;
            this.current = ModPoint.Infinity;
        }


        get U(): number {
            return this.u;
        }

        get V(): number {
            return this.v;
        }

        get Current(): ModPoint {
            return this.current;
        }


        step(): void {
            var index = this.current.partition(this.table.Length);
            var entry = this.table.at(index);
            this.u += entry.U;
            this.v += entry.V;
            this.current = this.current.add(entry.P);
        }


        toString(): string {
            return "[u = " + this.u + ", v = " + this.v + "]";
        }
    }
}

export = PollardRho;