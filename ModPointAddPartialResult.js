define(["require", "exports"], function(require, exports) {
    // either num and denom are set, or result is set
    var ModPointAddPartialResult = (function () {
        function ModPointAddPartialResult() {
        }
        ModPointAddPartialResult.fromDivision = function (num, denom) {
            var res = new ModPointAddPartialResult();
            res._num = num;
            res._denom = denom;
            return res;
        };

        ModPointAddPartialResult.fromResult = function (result) {
            var res = new ModPointAddPartialResult();
            res._res = result;
            return res;
        };

        Object.defineProperty(ModPointAddPartialResult.prototype, "numerator", {
            get: function () {
                return this._num;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPointAddPartialResult.prototype, "denominator", {
            get: function () {
                return this._denom;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(ModPointAddPartialResult.prototype, "result", {
            get: function () {
                return this._res;
            },
            enumerable: true,
            configurable: true
        });
        return ModPointAddPartialResult;
    })();

    
    return ModPointAddPartialResult;
});
//# sourceMappingURL=ModPointAddPartialResult.js.map
