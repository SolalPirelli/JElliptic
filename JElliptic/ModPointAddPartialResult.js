define(["require", "exports"], function(require, exports) {
    // either num and denom are set, or result is set
    var ModPointAddPartialResult = (function () {
        function ModPointAddPartialResult() {
        }
        ModPointAddPartialResult.fromDivision = function (num, denom) {
            var res = new ModPointAddPartialResult();
            res.num = num;
            res.denom = denom;
            return res;
        };

        ModPointAddPartialResult.fromResult = function (result) {
            var res = new ModPointAddPartialResult();
            res.result = result;
            return res;
        };

        Object.defineProperty(ModPointAddPartialResult.prototype, "Numerator", {
            get: function () {
                return this.num;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPointAddPartialResult.prototype, "Denominator", {
            get: function () {
                return this.denom;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPointAddPartialResult.prototype, "Result", {
            get: function () {
                return this.result;
            },
            enumerable: true,
            configurable: true
        });
        return ModPointAddPartialResult;
    })();

    
    return ModPointAddPartialResult;
});
//# sourceMappingURL=ModPointAddPartialResult.js.map
