/// <reference path="lib/qunit.d.ts" />
define(["require", "exports", "BigInteger", "ModNumber"], function(require, exports, BigInteger, ModNumber) {
    var ModNumberTests;
    (function (ModNumberTests) {
        function run() {
            QUnit.module("ModNumber");

            test("constructor value is modulo-ed", function () {
                var num = ModNumber.create(BigInteger.fromInt(10), BigInteger.fromInt(3));

                equal(0, num.value.compare(BigInteger.fromInt(1)));
            });
        }
        ModNumberTests.run = run;
    })(ModNumberTests || (ModNumberTests = {}));

    
    return ModNumberTests;
});
//# sourceMappingURL=ModNumberTests.js.map
