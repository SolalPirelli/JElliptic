import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import ModPointAddPartialResult = require("ModPointAddPartialResult");
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

        var walks = Array<CurveWalk>();

        for (var n = 0; n < config.ParrallelWalksCount; n++) {
            walks[n] = new CurveWalk(table);
        }

        console.clear();

        for (var step = BigInteger.Zero; step.lt(config.Curve.N); step = step.add(BigInteger.One)) {
            var N = config.ParrallelWalksCount;

            var x = Array<ModPointAddPartialResult>(N);

            for (var n = 0; n < N; n++) {
                x[n] = walks[n].beginStep();
            }

            var a = Array<ModNumber>(N);
            a[0] = x[0].Denominator;
            for (var n = 1; n < N; n++) {
                a[n] = a[n - 1].mul(x[n].Denominator);
            }

            var xinv = Array<ModNumber>();
            var ainv = Array<ModNumber>();
            ainv[N - 1] = a[N - 1].invert();
            for (var n = N - 1; n > 0; n--) {
                xinv[n] = ainv[n].mul(a[n - 1]);
                ainv[n - 1] = ainv[n].mul(x[n].Denominator);
            }
            xinv[0] = ainv[0];

            for (var n = 0; n < config.ParrallelWalksCount; n++) {
                var lambda = x[n].Numerator.mul(xinv[n]);

                walks[n].endStep(lambda);

                if (isDistinguished(walks[n].Current, config)) {
                    Server.send(walks[n].U, walks[n].V, walks[n].Current);
                }
            }
        }
    }

    function isDistinguished(point: ModPoint, config: Config): boolean {
        return (point.X.Value.and(config.DistinguishedPointMask)).eq(config.DistinguishedPointMask);
    }

    // Walk over a problem.
    class CurveWalk {
        private table: Addition.Table;

        private u: ModNumber;
        private v: ModNumber;
        private current: ModPoint;

        private currentEntry: Addition.TableEntry;


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


        beginStep(): ModPointAddPartialResult {
            var index = this.current.partition(this.table.Length);
            this.currentEntry = this.table.at(index);
            this.u = this.u.add(this.currentEntry.U);
            this.v = this.v.add(this.currentEntry.V);
            return this.current.beginAdd(this.currentEntry.P);
        }

        endStep(lambda: ModNumber): void {
            this.current = this.current.endAdd(this.currentEntry.P, lambda);
        }


        toString(): string {
            return "[u = " + this.u + ", v = " + this.v + "]";
        }
    }
}

export = PollardRho;