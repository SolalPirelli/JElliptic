"use strict";
define(["require", "exports", "ModPoint"], function(require, exports, ModPoint) {
    var ModPointSet = (function () {
        function ModPointSet() {
            this._buckets = [];
            for (var n = 0; n < ModPointSet.BUCKET_COUNT; n++) {
                this._buckets[n] = new Array();
            }

            this._containsInfinity = false;
            this._size = 0;
        }
        Object.defineProperty(ModPointSet.prototype, "size", {
            get: function () {
                return this._size;
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
            if (this.contains(point)) {
                return false;
            }

            this._size++;

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
