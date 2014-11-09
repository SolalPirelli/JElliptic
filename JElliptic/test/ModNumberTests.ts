/// <reference path="lib/qunit.d.ts" />

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");

QUnit.module("ModNumber");

test("constructor value is modulo-ed", () => {
    var num = new ModNumber(BigInteger.fromInt(10), BigInteger.fromInt(3));

    ok(num.value.eq(BigInteger.fromInt(1)));
});