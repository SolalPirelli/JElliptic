define(["require", "exports", "BigInteger", "ModNumber"], function(require, exports, BigInteger, ModNumber) {
    var Table = (function () {
        function Table(generator, target, config) {
            this._entries = new Array(config.additionTableLength);

            var order = BigInteger.fromInt(generator.getOrder());
            var rng = Table.getRng(config.additionTableSeed);

            for (var n = 0; n < this._entries.length; n++) {
                var u = new ModNumber(rng(this._entries.length), order);
                var v = new ModNumber(rng(this._entries.length), order);
                var p = generator.mulNum(u.value).add(target.mulNum(v.value));
                this._entries[n] = new TableEntry(u, v, p);
            }
        }
        Table.prototype.at = function (index) {
            return this._entries[index];
        };

        Object.defineProperty(Table.prototype, "length", {
            get: function () {
                return this._entries.length;
            },
            enumerable: true,
            configurable: true
        });

        // Very simple seeded RNG, based on http://stackoverflow.com/a/23304189
        Table.getRng = function (seed) {
            return function (exclusiveMax) {
                seed = Math.cos(seed) * 10000;
                return BigInteger.fromInt(Math.round((seed - Math.floor(seed)) * (exclusiveMax - 1)));
            };
        };
        return Table;
    })();
    exports.Table = Table;

    var TableEntry = (function () {
        function TableEntry(u, v, p) {
            this._u = u;
            this._v = v;
            this._p = p;
        }
        Object.defineProperty(TableEntry.prototype, "u", {
            get: function () {
                return this._u;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TableEntry.prototype, "v", {
            get: function () {
                return this._v;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TableEntry.prototype, "p", {
            get: function () {
                return this._p;
            },
            enumerable: true,
            configurable: true
        });
        return TableEntry;
    })();
    exports.TableEntry = TableEntry;
});
//# sourceMappingURL=AdditionTable.js.map
