import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import IConfig = require("IConfig");

export class Table {
    private _entries: TableEntry[];


    constructor(config: IConfig) {
        this._entries = new Array(config.additionTableLength);

        var order = BigInteger.fromInt(config.generator.getOrder());
        var rng = Table.getRng(config.additionTableSeed);

        for (var n = 0; n < this._entries.length; n++) {
            var u = new ModNumber(rng(this._entries.length), order);
            var v = new ModNumber(rng(this._entries.length), order);
            var p = config.generator.mulNum(u.value).add(config.target.mulNum(v.value));
            this._entries[n] = new TableEntry(u, v, p);
        }
    }


    public at(index: number): TableEntry {
        return this._entries[index];
    }

    get length(): number {
        return this._entries.length;
    }


    // Very simple seeded RNG, based on http://stackoverflow.com/a/23304189
    private static getRng(seed: number): (exclusiveMax: number) => BigInteger {
        return exclusiveMax => {
            seed = Math.cos(seed) * 10000;
            return BigInteger.fromInt(Math.round((seed - Math.floor(seed)) * (exclusiveMax - 1)));
        };
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