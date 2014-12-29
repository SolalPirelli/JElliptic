/// <reference path="lib/qunit.d.ts" />

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");

module ModPointTests {
    export function run() {
        QUnit.module("ModPoint");

        test("add works", () => {
            var curve = new ModCurve(
                BigInteger.parse("0"),
                BigInteger.parse("3"),
                BigInteger.parse("31"),
                BigInteger.parse("43"));
            var point1 = ModPoint.create(BigInteger.parse("24"), BigInteger.parse("1"), curve);
            var point2 = ModPoint.create(BigInteger.parse("16"), BigInteger.parse("10"), curve);
            var expected = ModPoint.create(BigInteger.parse("16"), BigInteger.parse("21"), curve);

            var actual = point1.add(point2);

            ok(expected.eq(actual), "Got " + actual);
        });

        test("add works as a double", () => {
            var curve = new ModCurve(
                BigInteger.parse("0"),
                BigInteger.parse("3"),
                BigInteger.parse("31"),
                BigInteger.parse("43"));
            var point = ModPoint.create(BigInteger.parse("9"), BigInteger.parse("9"), curve);
            var expected = ModPoint.create(BigInteger.parse("17"), BigInteger.parse("7"), curve);

            var actual = point.add(point);

            ok(expected.eq(actual), "Got " + actual);
        });

        test("mulNum works", () => {
            var curve = new ModCurve(
                BigInteger.parse("4451685225093714772084598273548424"),
                BigInteger.parse("2061118396808653202902996166388514"),
                BigInteger.parse("4451685225093714772084598273548427"),
                BigInteger.parse("4451685225093714776491891542548933"));
            var point = ModPoint.create(BigInteger.parse("188281465057972534892223778713752"), BigInteger.parse("3419875491033170827167861896082688"), curve);

            var expected = ModPoint.create(BigInteger.parse("4098991741095872007391701171131516"), BigInteger.parse("3475608823288928154126370692475487"), curve);

            var actual = point.mulNum(5);

            ok(expected.eq(actual));
        });
    }
}

export = ModPointTests;