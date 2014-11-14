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

        if (config.parrallelWalksCount == 1) {
            runOneWalk(config, resultSink, table);
        } else {
            runMultipleWalks(config, resultSink, table);
        }
    }

    function runOneWalk(config: IConfig, resultSink: IResultSink, table: Addition.Table) {
        var walk = new CurveWalk(table);

        for (var step = BigInteger.ZERO; step.lt(config.curve.n); step = step.add(BigInteger.ONE)) {
            walk.fullStep();

            if (isDistinguished(walk.current, config)) {
                resultSink.send(walk.u, walk.v, walk.current);
            }
        }
    }

    function runMultipleWalks(config: IConfig, resultSink: IResultSink, table: Addition.Table) {
        var walks = Array<CurveWalk>();

        for (var n = 0; n < config.parrallelWalksCount; n++) {
            walks[n] = new CurveWalk(table);
        }

        for (var step = BigInteger.ZERO; step.lt(config.curve.n); step = step.add(BigInteger.ONE)) {
            var N = config.parrallelWalksCount;

            var x = Array<ModPointAddPartialResult>(N);

            for (var n = 0; n < N; n++) {
                x[n] = walks[n].beginStep();
            }

            var a = Array<ModNumber>(N);
            a[0] = x[0].denominator;
            for (var n = 1; n < N; n++) {
                a[n] = a[n - 1].mul(x[n].denominator);
            }

            var xinv = Array<ModNumber>();
            var ainv = Array<ModNumber>();
            ainv[N - 1] = a[N - 1].invert();
            for (var n = N - 1; n > 0; n--) {
                xinv[n] = ainv[n].mul(a[n - 1]);
                ainv[n - 1] = ainv[n].mul(x[n].denominator);
            }
            xinv[0] = ainv[0];

            for (var n = 0; n < config.parrallelWalksCount; n++) {
                var lambda = x[n].numerator.mul(xinv[n]);

                walks[n].endStep(lambda);

                if (isDistinguished(walks[n].current, config)) {
                    resultSink.send(walks[n].u, walks[n].v, walks[n].current);
                }
            }
        }
    }

    function isDistinguished(point: ModPoint, config: IConfig): boolean {
        return point != ModPoint.INFINITY && (point.x.value.and(config.distinguishedPointMask)).eq(config.distinguishedPointMask);
    }

    // Walk over a problem.
    class CurveWalk {
        private _table: Addition.Table;

        private _u: ModNumber;
        private _v: ModNumber;
        private _current: ModPoint;

        private _currentEntry: Addition.TableEntry;


        constructor(table: Addition.Table) {
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


        beginStep(): ModPointAddPartialResult {
            var index = this._current.partition(this._table.length);
            this._currentEntry = this._table.at(index);
            this._u = this._u.add(this._currentEntry.u);
            this._v = this._v.add(this._currentEntry.v);
            return this._current.beginAdd(this._currentEntry.p);
        }

        endStep(lambda: ModNumber): void {
            this._current = this._current.endAdd(this._currentEntry.p, lambda);
        }

        fullStep() {
            var index = this._current.partition(this._table.length);
            this._currentEntry = this._table.at(index);
            this._u = this._u.add(this._currentEntry.u);
            this._v = this._v.add(this._currentEntry.v);
            this._current = this._current.add(this._currentEntry.p);
        }


        toString(): string {
            return "[u = " + this._u + ", v = " + this._v + "]";
        }
    }
}

export = PollardRho;