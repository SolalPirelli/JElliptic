import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import Config = require("Config");

export class Table {
    private entries: TableEntry[];


    constructor(generator: ModPoint, target: ModPoint, config: Config) {
        this.entries = new Array(config.AdditionTableLength);

        var order = BigInteger.fromInt(generator.getOrder());
        var rng = Table.getRng(config.AdditionTableSeed);

        for (var n = 0; n < this.entries.length; n++) {
            var u = new ModNumber(rng(this.entries.length), order);
            var v = new ModNumber(rng(this.entries.length), order);
            var p = generator.mulNum(u.Value).add(target.mulNum(v.Value));
            this.entries[n] = new TableEntry(u, v, p);
        }
    }


    public at(index: number): TableEntry {
        return this.entries[index];
    }

    get Length(): number {
        return this.entries.length;
    }


    // Very simple seeded RNG, from http://stackoverflow.com/a/23304189
    private static getRng(seed: number): (exclusiveMax: number) => BigInteger {
        return function (exclusiveMax) {
            seed = Math.sin(seed + 0.01) * 10000;
            return BigInteger.fromInt(Math.round((seed - Math.floor(seed)) * (exclusiveMax - 1)));
        };
    }
}

export class TableEntry {
    private u: ModNumber;
    private v: ModNumber;
    private p: ModPoint;

    constructor(u: ModNumber, v: ModNumber, p: ModPoint) {
        this.u = u;
        this.v = v;
        this.p = p;
    }

    get U(): ModNumber {
        return this.u;
    }

    get V(): ModNumber {
        return this.v;
    }

    get P(): ModPoint {
        return this.p;
    }
}