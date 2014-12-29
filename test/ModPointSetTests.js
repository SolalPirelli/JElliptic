/// <reference path="lib/qunit.d.ts" />
define(["require", "exports", "BigInteger", "ModCurve", "ModPoint", "ModPointSet"], function(require, exports, BigInteger, ModCurve, ModPoint, ModPointSet) {
    var ModPointSetTests;
    (function (ModPointSetTests) {
        var CURVE = new ModCurve(BigInteger.parse("0"), BigInteger.parse("3"), BigInteger.parse("31"), BigInteger.parse("43"));

        function setWith() {
            var vals = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                vals[_i] = arguments[_i + 0];
            }
            var pointSet = new ModPointSet();
            for (var n = 0; n < Math.floor(vals.length / 2); n++) {
                var x = BigInteger.parse(vals[2 * n]);
                var y = BigInteger.parse(vals[2 * n + 1]);
                var point = ModPoint.create(x, y, CURVE);
                pointSet.add(point);
            }
            return pointSet;
        }

        function contains(name, x, y, pointSet) {
            var xp = BigInteger.parse(x);
            var yp = BigInteger.parse(y);
            var point = ModPoint.create(xp, yp, CURVE);

            test(name, function () {
                ok(pointSet.contains(point));
            });
        }

        function doesNotContain(name, x, y, pointSet) {
            var xp = BigInteger.parse(x);
            var yp = BigInteger.parse(y);
            var point = ModPoint.create(xp, yp, CURVE);

            test(name, function () {
                ok(!pointSet.contains(point));
            });
        }

        function run() {
            QUnit.module("ModPointSet");

            doesNotContain("Set with no elements", "11", "1", setWith());

            contains("Set with one element", "11", "1", setWith("11", "1"));

            contains("Set with many times the same element", "11", "1", setWith("11", "1", "11", "1", "11", "1"));

            doesNotContain("Set with some elements but not the searched one.", "11", "1", setWith("5", "2", "14", "9", "18", "10"));

            contains("Set with some elements including the searched one.", "11", "1", setWith("5", "2", "11", "1", "14", "9", "18", "10"));
        }
        ModPointSetTests.run = run;
    })(ModPointSetTests || (ModPointSetTests = {}));

    
    return ModPointSetTests;
});
//# sourceMappingURL=ModPointSetTests.js.map
