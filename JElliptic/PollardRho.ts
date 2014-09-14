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

        var tortoise = new CurveWalk(table);
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

            if (tortoise.Current.eq(hare.Current) && !tortoise.V.eq(hare.V)) {
                var log = tortoise.U.sub(hare.U).div(hare.V.sub(tortoise.V));

                var actualTarget = generator.mulNum(log.Value);
                if (!target.eq(actualTarget)) {
                    throw "Incorrect result found. (" + log + ")";
                }

                return log.Value;
            }
        }
        throw "No result found.";
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
            this.u=this.u.add(entry.U);
            this.v =this.v.add( entry.V);
            this.current = this.current.add(entry.P);
        }


        toString(): string {
            return "[u = " + this.u + ", v = " + this.v + "]";
        }
    }
}

export = PollardRho;