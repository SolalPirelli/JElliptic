import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import DeterministicRandom = require("DeterministicRandom");
import IConfig = require("IConfig");

export class Table {
    private _entries: TableEntry[];


    constructor(config: IConfig) {
        this._entries = new Array(config.additionTableLength);

        var rng = new DeterministicRandom(config.additionTableSeed);

        for (var n = 0; n < this._entries.length; n++) {
            var u = rng.next(this._entries.length);
            var v = rng.next(this._entries.length);

            var um = ModNumber.create(BigInteger.fromInt(u), config.curve.order);
            var vm = ModNumber.create(BigInteger.fromInt(v), config.curve.order);
            var p = config.generator.mulNum(u).add(config.target.mulNum(v));
            this._entries[n] = new TableEntry(um, vm, p);
        }
    }


    public at(index: number): TableEntry {
        return this._entries[index];
    }

    get length(): number {
        return this._entries.length;
    }
}

export class TableEntry {
    private _u: ModNumber;
    private _v: ModNumber;
    private _p: ModPoint;

    constructor(u: ModNumber, v: ModNumber, p: ModPoint) {
        this._u = u;
        this._v = v;
        this._p = p;
    }

    get u(): ModNumber {
        return this._u;
    }

    get v(): ModNumber {
        return this._v;
    }

    get p(): ModPoint {
        return this._p;
    }
}