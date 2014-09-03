define(["require", "exports", "ModNumber"], function(require, exports, ModNumber) {
    var ModCurve = (function () {
        function ModCurve(a, b, n) {
            this.a = new ModNumber(a, n);
            this.b = new ModNumber(b, n);
            this.n = n;
        }
        Object.defineProperty(ModCurve.prototype, "A", {
            get: function () {
                return this.a;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModCurve.prototype, "B", {
            get: function () {
                return this.b;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModCurve.prototype, "N", {
            get: function () {
                return this.n;
            },
            enumerable: true,
            configurable: true
        });

        ModCurve.prototype.toString = function () {
            return "y² = x³ + " + this.a.Value + "x + " + this.b.Value + " (mod " + this.n + ")";
        };
        return ModCurve;
    })();

    
    return ModCurve;
});
//# sourceMappingURL=ModCurve.js.map
