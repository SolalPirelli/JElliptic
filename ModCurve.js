define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var ModCurve = (function () {
        function ModCurve(a, b, n, order) {
            this._a = ModNumber.create(a, n);
            this._b = ModNumber.create(b, n);
            this._order = order;
        }
        Object.defineProperty(ModCurve.prototype, "a", {
            get: function () {
                return this._a;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModCurve.prototype, "b", {
            get: function () {
                return this._b;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModCurve.prototype, "n", {
            get: function () {
                return this._a.n;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModCurve.prototype, "order", {
            get: function () {
                return this._order;
            },
            enumerable: true,
            configurable: true
        });

        ModCurve.prototype.toString = function () {
            return "y² = x³ + " + this.a.value + "x + " + this.b.value + " (mod " + this.n + ")";
        };
        return ModCurve;
    })();

    
    return ModCurve;
});
//# sourceMappingURL=ModCurve.js.map
