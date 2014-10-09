/// <reference path="lib/qunit.d.ts" />
/// <reference path="../BigInteger.ts" />

import BigInteger = require("BigInteger");

QUnit.module("BigInteger");

function equivalent(str: string, n: number) {
    test("parse: " + n, () => {
        var parsed = BigInteger.parse(str);
        var expected = BigInteger.fromInt(n);

        ok(parsed.eq(expected));
    });

    test("toString: " + str, () => {
        var actual = BigInteger.fromInt(n).toString();

        equal(actual, str);
    });
}

function roundtripS(str: string) {
    test("string round-trip: " + str, () => {
        var parsed = BigInteger.parse(str);
        var actual = parsed.toString();

        equal(actual, str);
    });
}

function roundtripI(n: number) {
    test("int round-trip: " + n, () => {
        var parsed = BigInteger.fromInt(n);
        var actual = parsed.toInt();

        equal(actual, n);
    });
}

function add(s1: string, s2: string, sum: string) {
    var i1 = BigInteger.parse(s1);
    var i2 = BigInteger.parse(s2);
    var iSum = BigInteger.parse(sum);

    test("add: " + s1 + " + " + s2, () => {
        var actualSum = i1.add(i2);
        ok(actualSum.eq(iSum), "Expected " + sum + ", got " + actualSum.toString());
    });

    if (s1 != s2) {
        test("add: " + s2 + " + " + s1, () => {
            var actualSum = i2.add(i1);
            ok(actualSum.eq(iSum), "Expected " + sum + ", got " + actualSum.toString());
        });
    }
}

equivalent("-1", -1);
equivalent("0", 0);
equivalent("1", 1);
equivalent("-1000000000", -1000000000);
equivalent("1000000000", 1000000000);
equivalent("8794308446", 8794308446);
equivalent("-234655687", -234655687);

roundtripS("-1");
roundtripS("0");
roundtripS("-1");
roundtripS("-10000000000000000000000");
roundtripS("10000000000000000000000");
roundtripS("843654783738219391462891409156201482963598234021939235792375230490324365");
roundtripS("-96758932056432684895346825495765794382534257436257190023854239555353");

roundtripI(-1);
roundtripI(0);
roundtripI(1);
roundtripI(-1000000000);
roundtripI(1000000000);
roundtripI(4365447743);
roundtripI(-578445757);

add("0", "0", "0");
add("1", "-1", "0");
add("100", "-1", "99");
add("100", "100", "200");
add("100", "-100", "0");
add("10000000000000000000", "-9999999999999999999", "1");