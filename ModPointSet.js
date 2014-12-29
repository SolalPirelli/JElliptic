define(["require", "exports", "ModPoint"], function(require, exports, ModPoint) {
    var ModPointSet = (function () {
        function ModPointSet() {
            this._buckets = [];
            for (var n = 0; n < ModPointSet.BUCKET_COUNT; n++) {
                this._buckets[n] = new Array();
            }

            this._containsInfinity = false;
            this._totalCount = 0;
            this._duplicatesCount = 0;
        }
        Object.defineProperty(ModPointSet.prototype, "uniqueFraction", {
            get: function () {
                return 1.0 - (this._duplicatesCount / this._totalCount);
            },
            enumerable: true,
            configurable: true
        });

        ModPointSet.prototype.contains = function (point) {
            if (point == ModPoint.INFINITY) {
                return this._containsInfinity;
            }

            var hash = point.x.value.partition(ModPointSet.BUCKET_COUNT);
            var bucket = this._buckets[hash];
            for (var n = 0; n < bucket.length; n++) {
                if (point.eq(bucket[n])) {
                    return true;
                }
            }
            return false;
        };

        ModPointSet.prototype.add = function (point) {
            this._totalCount++;

            if (this.contains(point)) {
                this._duplicatesCount++;
                return false;
            }

            if (point == ModPoint.INFINITY) {
                this._containsInfinity = true;
                return true;
            }

            var hash = point.x.value.partition(ModPointSet.BUCKET_COUNT);
            this._buckets[hash].push(point);
            return true;
        };
        ModPointSet.BUCKET_COUNT = 32;
        return ModPointSet;
    })();

    
    return ModPointSet;
});
//# sourceMappingURL=ModPointSet.js.map
