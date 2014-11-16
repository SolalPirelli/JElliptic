﻿/// <reference path="lib/qunit.d.ts" />

import BigInteger = require("BigInteger");

module BigIntegerTests {
    function equivalent(str: string, n: number) {
        test("parse: " + n, () => {
            var actual = BigInteger.parse(str).toInt();

            equal(actual, n);
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

    function op(name: string, s1: string, s2: string, result: string, op: (b1: BigInteger, b2: BigInteger) => BigInteger) {
        test(name + ": " + s1 + ", " + s2, () => {
            var i1 = BigInteger.parse(s1);
            var i2 = BigInteger.parse(s2);
            var iResult = BigInteger.parse(result);

            var actualResult = op(i1, i2);
            ok(actualResult.eq(iResult), "Expected " + result + ", got " + actualResult.toString());
        });
    }

    function binOp(name: string, s1: string, s2: string, result: boolean, op: (b1: BigInteger, b2: BigInteger) => boolean) {
        test(name + ": " + s1 + ", " + s2, () => {
            var i1 = BigInteger.parse(s1);
            var i2 = BigInteger.parse(s2);

            var actualResult = op(i1, i2);
            equal(actualResult, result);
        });
    }

    function negate(s1: string, s2: string) {
        var i1 = BigInteger.parse(s1);
        var i2 = BigInteger.parse(s2);

        test("neg: " + s1, () => {
            ok(i1.negate().eq(i2));
        });
        test("neg: " + s2, () => {
            ok(i2.negate().eq(i1));
        });
    }

    function add(s1: string, s2: string, result: string) {
        op("add", s1, s2, result, (b1, b2) => b1.add(b2));
        op("sub", result, s2, s1, (b1, b2) => b1.sub(b2));

        if (s1 != s2) {
            op("add", s2, s1, result, (b1, b2) => b1.add(b2));
            op("sub", result, s1, s2, (b1, b2) => b1.sub(b2));
        }
    }

    function mul(s1: string, s2: string, result: string) {
        op("mul", s1, s2, result, (b1, b2) => b1.mul(b2));
    }

    function mod(s1: string, s2: string, result: string) {
        op("mod", s1, s2, result, (b1, b2) => b1.mod(b2));
    }

    function modInverse(s1: string, s2: string, result: string) {
        op("modInverse", s1, s2, result, (b1, b2) => b1.modInverse(b2));
    }

    function and(s1: string, s2: string, result: string) {
        op("and", s1, s2, result, (b1, b2) => b1.and(b2));

        if (s1 != s2) {
            op("and", s2, s1, result, (b1, b2) => b1.and(b2));
        }
    }

    function lte(s1: string, s2: string, result: boolean) {
        binOp("lte", s1, s2, result, (b1, b2) => b1.lte(b2));
        binOp("gt", s1, s2, !result, (b1, b2) => b1.gt(b2));
    }

    function lt(s1: string, s2: string, result: boolean) {
        binOp("lt", s1, s2, result, (b1, b2) => b1.lt(b2));
        binOp("gte", s1, s2, !result, (b1, b2) => b1.gte(b2));
    }

    function eq(s1: string, s2: string, result: boolean) {
        binOp("eq", s1, s2, result, (b1, b2) => b1.eq(b2));
        if (s1 != s2) {
            binOp("eq", s2, s1, result, (b1, b2) => b1.eq(b2));
        }
    }

    export function run() {
        QUnit.module("BigInteger");

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

        negate("0", "0");
        negate("1", "-1");
        negate("843654783738219391462891409156201482963598234021939235792375230490324365",
            "-843654783738219391462891409156201482963598234021939235792375230490324365");

        add("0", "0", "0");
        add("1", "1", "2");
        add("2", "-1", "1");
        add("-2", "1", "-1");
        add("0", "-1", "-1");
        add("1", "-1", "0");
        add("100", "-1", "99");
        add("100", "100", "200");
        add("100", "-100", "0");
        add("-1", "10000000000000000000", "9999999999999999999");
        add("10000000000000000000", "-9999999999999999999", "1");
        add("843654783738219391462891409156201482963598234021939235792375230490324365",
            "96758932056432684895346825495765794382534257436257190023854239555353",
            "843751542670275824147786755981697248757980768279375492982399084729879718");
        add("543289470472352940785052848524369767097846568215389483856709568687235642308456098736459436084375639568567568947064359250396764569539078680579056789560345064087990087865665564673893456709870830467976",
            "467586968432426897080795674542427890987965746354365897086584635436586908796857465343658670908965746354645879608790896574635464785669078856746375687960878965746358697098956746375687690796857463588855",
            "1010876438904779837865848523066797658085812314569755380943294204123822551105313564080118106993341385923213448555855255825032229355208157537325432477521224029834348784964622311049581147506728294056831");
        add("249731758160310955319",
            "1794566138064068726342075845",
            "1794566387795826886653031164");
        add("843558024806162958777996062330705717169215699764502978602351376250769012",
            "96758932056432684895346825495765794382534257436257190023854239555353",
            "843654783738219391462891409156201482963598234021939235792375230490324365");
        add("75702502039926043704257173981941876109880821861023586770124933250648733511598633392800765175409893213921689338273462675761299783869999823832681101599466098341631390766708818298205765913013366879121",
            "467586968432426897080795674542427890987965746354365897086584635436586908796857465343658670908965746354645879608790896574635464785669078856746375687960878965746358697098956746375687690796857463588855",
            "543289470472352940785052848524369767097846568215389483856709568687235642308456098736459436084375639568567568947064359250396764569539078680579056789560345064087990087865665564673893456709870830467976");

        mul("0", "0", "0");
        mul("0", "843654783738219391462891409156201482963598234021939235792375230490324365", "0");
        mul("0", "-1", "0");
        mul("-1", "-1", "1");
        mul("100", "33", "3300");
        mul("111111111", "111111111", "12345678987654321");
        mul("123456789", "987654321", "121932631112635269");
        mul("30986589340540573524", "568092635996242442560", "17603253219000762188884196338333026781440");
        mul("10000000000000000", "10000000000000000", "100000000000000000000000000000000");
        mul("-1",
            "843654783738219391462891409156201482963598234021939235792375230490324365",
            "-843654783738219391462891409156201482963598234021939235792375230490324365");
        mul("235792375230490324365", "257190023854239555353", "60643446610177610597233595968726342075845");
        mul("201482963598234021939235792375230490324365",
            "495765794382534257436257190023854239555353",
            "99888361502825722750625541991816639206337292740267966437728204233595968726342075845");
        mul("843654783738219391462891409156201482963598234021939235792375230490324365",
            "96758932056432684895346825495765794382534257436257190023854239555353",
            "81631135898810780470790196457358272631935994421889038215604253548418790152344523969837735095109530292740267966437728204233595968726342075845");
        mul("543289470472352940785052848524369767097846568215389483856709568687235642308456098736459436084375639568567568947064359250396764569539078680579056789560345064087990087865665564673893456709870830467976",
            "467586968432426897080795674542427890987965746354365897086584635436586908796857465343658670908965746354645879608790896574635464785669078856746375687960878965746358697098956746375687690796857463588855",
            "254035076479426019340594546872390696657450013636937553592209967044938614222573145834966279990730846605251995770667228959133092411176842804303838361518473855072336386442013722286487217846344094283967837740713878131677340902835242275332405296616280650531602738891946134863002825970562096488655938529223509941016500426763782435002746798602698877891501422122536970784592995165050890745445980108007480");

        mod("0", "2", "0");
        mod("1", "2", "1");
        mod("2", "2", "0");
        mod("5", "2", "1");
        mod("2", "3", "2");
        mod("984385", "2", "1");
        mod("123456789", "111111111", "12345678");
        mod("-1", "2", "1");
        mod("-2", "2", "0");
        mod("-5", "2", "1");
        mod("-2", "3", "1");

        modInverse("1", "10", "1");
        modInverse("2", "3", "2");
        modInverse("4", "5", "4");
        modInverse("2", "23", "12");
        modInverse("89548743", "975378538", "134684991");
        modInverse("12345678", "1234567891", "908967567");

        and("0", "0", "0");
        and("0", "1", "0");
        and("1", "1", "1");
        and("2", "1", "0");
        and("3", "1", "1");
        and("63", "13", "13");

        lte("0", "0", true);
        lte("0", "1", true);
        lte("1", "1", true);
        lte("1", "10", true);
        lte("100000000000", "100000000000000000000000000000", true);
        lte("100000000000000000000000000000", "100000000000000000000000000001", true);
        lte("100000000000000000000000000000", "200000000000000000000000000000", true);
        lte("-1", "0", true);
        lte("-10", "-1", true);
        lte("-10000000000000000000000000000000", "-100000", true);
        lte("-200000000000000000000000000000", "-100000000000000000000000000000", true);
        lte("0", "-1", false);
        lte("1", "-1", false);
        lte("-1", "-10", false);
        lte("10000000000000000000000000000000", "100000", false);
        lte("100000000000000000000000000001", "100000000000000000000000000000", false);

        lt("0", "1", true);
        lt("1", "10", true);
        lt("100000000000", "100000000000000000000000000000", true);
        lt("100000000000000000000000000000", "100000000000000000000000000001", true);
        lt("100000000000000000000000000000", "200000000000000000000000000000", true);
        lt("-1", "0", true);
        lt("-10", "-1", true);
        lt("-10000000000000000000000000000000", "-100000", true);
        lt("-200000000000000000000000000000", "-100000000000000000000000000000", true);
        lt("0", "0", false);
        lt("1", "1", false);
        lt("0", "-1", false);
        lt("1", "-1", false);
        lt("-1", "-10", false);
        lt("10000000000000000000000000000000", "100000", false);
        lt("100000000000000000000000000001", "100000000000000000000000000000", false);
        lt("-10000000000000000000000000000000", "-10000000000000000000000000000000", false);

        eq("0", "0", true);
        eq("-1", "-1", true);
        eq("123", "123", true);
        eq("123456789123456789123456789", "123456789123456789123456789", true);
        eq("0", "1", false);
        eq("-1", "1", false);
        eq("123456789123456789123456789", "123456789123456789123456780", false);
    }
}

export = BigIntegerTests;