import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import Config = require("Config");

export class Table {
    private entries: TableEntry[];


    constructor(generator: ModPoint, target: ModPoint, config: Config) {
        this.entries = new Array(config.AdditionTableLength);

        var rng = Table.getRng(config.AdditionTableSeed);

        for (var n = 0; n < this.entries.length; n++) {
            var u = Math.round(rng() * (this.entries.length - 1));
            var v = Math.round(rng() * (this.entries.length - 1));
            var p = generator.mulNum(u).add(target.mulNum(v));
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
    private static getRng(seed: number): () => number {
        return function () {
            seed = Math.sin(seed) * 10000;
            return seed - Math.floor(seed);
        };
    }
}

export class TableEntry {
    private u: number;
    private v: number;
    private p: ModPoint;

    constructor(u: number, v: number, p: ModPoint) {
        this.u = u;
        this.v = v;
        this.p = p;
    }

    get U(): number {
        return this.u;
    }

    get V(): number {
        return this.v;
    }

    get P(): ModPoint {
        return this.p;
    }
}