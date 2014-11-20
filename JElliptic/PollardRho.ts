import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import ModPointAddPartialResult = require("ModPointAddPartialResult");
import IConfig = require("IConfig");
import IResultSink = require("IResultSink");
import Addition = require("AdditionTable");

module PollardRho {
    // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
    export function run(config: IConfig, resultSink: IResultSink): void {
        var table = new Addition.Table(config);

        var walk: CurveWalk =
            config.parrallelWalksCount == 1 ?
            new SingleCurveWalk(config, table) : new MultiCurveWalk(config, table);

        for (var step = BigInteger.ZERO; step.compare(config.curve.n) == -1; step = step.add(BigInteger.ONE)) {
            walk.step();
            walk.send(resultSink);
        }
    }

    export interface CurveWalk {
        send(sink: IResultSink): void;
        step(): void;
    }

    export class SingleCurveWalk implements CurveWalk {
        private _config: IConfig;
        private _table: Addition.Table;

        private _u: ModNumber;
        private _v: ModNumber;
        private _current: ModPoint;

        private _currentEntry: Addition.TableEntry;


        constructor(config: IConfig, table: Addition.Table) {
            this._config = config;
            this._table = table;

            // TODO the starting entry needs to be random, of course
            var entry = this._table.at(0);
            this._u = entry.u;
            this._v = entry.v;
            this._current = entry.p;
        }


        get u(): ModNumber {
            return this._u;
        }

        get v(): ModNumber {
            return this._v;
        }

        get current(): ModPoint {
            return this._current;
        }

        step() {
            var index = this._current.partition(this._table.length);
            this._currentEntry = this._table.at(index);
            this._u = this._u.add(this._currentEntry.u);
            this._v = this._v.add(this._currentEntry.v);
            this.setCurrent(this._current.add(this._currentEntry.p));
        }

        send(sink: IResultSink): void {
            if (this._current != ModPoint.INFINITY && (this._current.x.value.and(this._config.distinguishedPointMask)).eq(this._config.distinguishedPointMask)) {
                sink.send(this._u, this._v, this._current);
            }
        }


        // beginStep and endStep are used by the multi-walk

        beginStep(): ModPointAddPartialResult {
            var index = this._current.partition(this._table.length);
            this._currentEntry = this._table.at(index);
            this._u = this._u.add(this._currentEntry.u);
            this._v = this._v.add(this._currentEntry.v);
            return this._current.beginAdd(this._currentEntry.p);
        }

        endStep(lambda: ModNumber): void {
            this.setCurrent(this._current.endAdd(this._currentEntry.p, lambda));
        }

        private setCurrent(candidate: ModPoint) {
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
        }
    }

    export class MultiCurveWalk implements CurveWalk {
        private _walks: SingleCurveWalk[];

        constructor(config: IConfig, table: Addition.Table) {
            this._walks = Array<SingleCurveWalk>(config.parrallelWalksCount);
            for (var n = 0; n < this._walks.length; n++) {
                this._walks[n] = new SingleCurveWalk(config, table);
            }
        }

        step(): void {
            var N = this._walks.length; // alias, for convenience

            var x = Array<ModPointAddPartialResult>(N);

            for (var n = 0; n < N; n++) {
                x[n] = this._walks[n].beginStep();
            }

            var a = Array<ModNumber>(N);
            a[0] = x[0].denominator;
            for (var n = 1; n < N; n++) {
                a[n] = a[n - 1].mul(x[n].denominator);
            }

            var xinv = Array<ModNumber>(N);
            var ainv = Array<ModNumber>(N);
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
        }

        send(sink: IResultSink): void {
            this._walks.forEach(w => w.send(sink));
        }
    }
}

export = PollardRho;