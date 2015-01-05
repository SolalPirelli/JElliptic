"use strict";
define(["require", "exports"], function(require, exports) {
    // either num and denom are set, or result is set
    var ModPointAddPartialResult = (function () {
        function ModPointAddPartialResult(num, denom, res) {
            this._num = num;
            this._denom = denom;
            this._res = res;
        }
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
