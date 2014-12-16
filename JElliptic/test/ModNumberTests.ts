/// <reference path="lib/qunit.d.ts" />
/// <reference path="../lib/biginteger.d.ts" />
import ModNumber = require("ModNumber");

module ModNumberTests {
    export function run() {
        QUnit.module("ModNumber");

        test("constructor value is modulo-ed", () => {
            var num = ModNumber.create(new BigInteger(10), new BigInteger(3));

            equal(0, BigInteger.ONE.compare(num.value));
        });
    }
}

export = ModNumberTests;