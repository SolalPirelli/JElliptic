/// <reference path="lib/qunit.d.ts" />

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");

module ModNumberTests {
    export function run() {
        QUnit.module("ModNumber");

        test("constructor value is modulo-ed", () => {
            var num = ModNumber.create(BigInteger.fromInt(10), BigInteger.fromInt(3));

            ok(num.value.eq(BigInteger.fromInt(1)));
        });
    }
}

export = ModNumberTests;