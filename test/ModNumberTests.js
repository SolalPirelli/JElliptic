/// <reference path="lib/qunit.d.ts" />
define(["require", "exports", "BigInteger", "ModNumber"], function(require, exports, BigInteger, ModNumber) {
    QUnit.module("ModNumber");

    test("constructor value is modulo-ed", function () {
        var num = new ModNumber(BigInteger.fromInt(10), BigInteger.fromInt(3));

        ok(num.value.eq(BigInteger.fromInt(1)));
    });
});
//# sourceMappingURL=ModNumberTests.js.map
