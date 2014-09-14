define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var Table = (function () {
        function Table(generator, target, config) {
            this.entries = new Array(config.AdditionTableLength);

            var order = generator.getOrder();
            var rng = Table.getRng(config.AdditionTableSeed);

            for (var n = 0; n < this.entries.length; n++) {
                var u = new ModNumber(rng(this.entries.length), order);
                var v = new ModNumber(rng(this.entries.length), order);
                var p = generator.mulNum(u.Value).add(target.mulNum(v.Value));
                this.entries[n] = new TableEntry(u, v, p);
            }
        }
        Table.prototype.at = function (index) {
            return this.entries[index];
        };

        Object.defineProperty(Table.prototype, "Length", {
            get: function () {
                return this.entries.length;
            },
            enumerable: true,
            configurable: true
        });

        // Very simple seeded RNG, from http://stackoverflow.com/a/23304189
        Table.getRng = function (seed) {
            return function (exclusiveMax) {
                seed = Math.sin(seed) * 10000;
                return Math.round((seed - Math.floor(seed)) * (exclusiveMax - 1));
            };
        };
        return Table;
    })();
    exports.Table = Table;

    var TableEntry = (function () {
        function TableEntry(u, v, p) {
            this.u = u;
            this.v = v;
            this.p = p;
        }
        Object.defineProperty(TableEntry.prototype, "U", {
            get: function () {
                return this.u;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TableEntry.prototype, "V", {
            get: function () {
                return this.v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TableEntry.prototype, "P", {
            get: function () {
                return this.p;
            },
            enumerable: true,
            configurable: true
        });
        return TableEntry;
    })();
    exports.TableEntry = TableEntry;
});
//# sourceMappingURL=AdditionTable.js.map
