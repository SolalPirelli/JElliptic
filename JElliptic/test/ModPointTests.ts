/// <reference path="lib/qunit.d.ts" />
/// <reference path="../lib/biginteger.d.ts" />

import ModNumber = require("ModNumber");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");

module ModPointTests {
    export function run() {
        QUnit.module("ModPoint");

        test("mulNum works", () => {
            var curve = new ModCurve(
                new BigInteger("4451685225093714772084598273548424"),
                new BigInteger("2061118396808653202902996166388514"),
                new BigInteger("4451685225093714772084598273548427"),
                new BigInteger("4451685225093714776491891542548933"));
            var point = ModPoint.create(new BigInteger("188281465057972534892223778713752"), new BigInteger("3419875491033170827167861896082688"), curve);

            var expected = ModPoint.create(new BigInteger("4098991741095872007391701171131516"), new BigInteger("3475608823288928154126370692475487"), curve);

            var actual = point.mulNum(5);

            ok(expected.eq(actual));
        });
    }
}

export =ModPointTests;