define(["require", "exports"], function(require, exports) {
    // Very simple seeded RNG, based on http://stackoverflow.com/a/23304189
    var DeterministicRandom = (function () {
        function DeterministicRandom(seed) {
            this._seed = seed;
        }
        DeterministicRandom.prototype.next = function (exclusiveMax) {
            this._seed = Math.cos(this._seed) * 10000;
            return Math.round((this._seed - Math.floor(this._seed)) * (exclusiveMax - 1));
        };
        return DeterministicRandom;
    })();

    
    return DeterministicRandom;
});
//# sourceMappingURL=DeterministicRandom.js.map
