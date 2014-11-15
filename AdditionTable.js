define(["require", "exports", "BigInteger", "ModNumber", "DeterministicRandom"], function(require, exports, BigInteger, ModNumber, DeterministicRandom) {
    var Table = (function () {
        function Table(config) {
            this._entries = new Array(config.additionTableLength);

            var order = BigInteger.fromInt(config.generator.getOrder());
            var rng = new DeterministicRandom(config.additionTableSeed);

            for (var n = 0; n < this._entries.length; n++) {
                var u = new ModNumber(rng.next(this._entries.length), order);
                var v = new ModNumber(rng.next(this._entries.length), order);
                var p = config.generator.mulNum(u.value).add(config.target.mulNum(v.value));
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
