/// <reference path="lib/qunit.d.ts" />

"use strict";

import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");
import ModPointSet = require("ModPointSet");

module ModPointSetTests {
    var CURVE = new ModCurve(BigInteger.parse("0"), BigInteger.parse("3"), BigInteger.parse("31"), BigInteger.parse("43"));

    function setWith(...vals: string[]): ModPointSet {
        var pointSet = new ModPointSet();
        for (var n = 0; n < Math.floor(vals.length / 2); n++) {
            var x = BigInteger.parse(vals[2 * n]);
            var y = BigInteger.parse(vals[2 * n + 1]);
            var point = ModPoint.fromBigInts(x, y, CURVE);
            pointSet.add(point);
        }
        return pointSet;
    }

    function contains(name: string, x: string, y: string, pointSet: ModPointSet): void {
        var xp = BigInteger.parse(x);
        var yp = BigInteger.parse(y);
        var point = ModPoint.fromBigInts(xp, yp, CURVE);

        test(name, () => {
            ok(pointSet.contains(point));
        });
    }

    function doesNotContain(name: string, x: string, y: string, pointSet: ModPointSet): void {
        var xp = BigInteger.parse(x);
        var yp = BigInteger.parse(y);
        var point = ModPoint.fromBigInts(xp, yp, CURVE);

        test(name, () => {
            ok(!pointSet.contains(point));
        });
    }

    export function run() {
        QUnit.module("ModPointSet");

        doesNotContain("Set with no elements",
            "11", "1",
            setWith());

        contains("Set with one element",
            "11", "1",
            setWith(
                "11", "1"));

        contains("Set with many times the same element",
            "11", "1",
            setWith(
                "11", "1",
                "11", "1",
                "11", "1"));

        doesNotContain("Set with some elements but not the searched one.",
            "11", "1",
            setWith(
                "5", "2",
                "14", "9",
                "18", "10"));

        contains("Set with some elements including the searched one.",
            "11", "1",
            setWith(
                "5", "2",
                "11", "1",
                "14", "9",
                "18", "10"));
    }
}

export = ModPointSetTests;