"use strict";

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");
import IConfig = require("IConfig");
import Addition = require("AdditionTable");
import PollardRho = require("PollardRho");
import BenchmarkSuite = require("bench/BenchmarkSuite");

function bigIntegerSuite() {
    var i1_smaller = BigInteger.parse("1");
    var i1_larger = BigInteger.parse("9");

    var i20_smaller = BigInteger.parse("12345678901234567890");
    var i20_larger = BigInteger.parse("71755440315342536873");

    var i40_smaller = BigInteger.parse("1247392211317907151303247721489640699240");
    var i40_larger = BigInteger.parse("1550031797834347859248576414813139942411");

    var s = BenchmarkSuite.create("BigInteger");

    s("Create from 1-digit int", () => BigInteger.fromInt(9));
    s("Create from 16-digit int", () => BigInteger.fromInt(9007199254740991));

    s("Parse 1-digit number", () => BigInteger.parse("1"));
    s("Parse 20-digit number", () => BigInteger.parse("1234578901234567890"));
    s("Parse 40-digit number", () => BigInteger.parse("1317953763239595888465524145589872695690"));

    s("Negate a 1-digit number", () => i1_smaller.negate());
    s("Negate a 20-digit number", () => i20_smaller.negate());
    s("Negate a 40-digit number", () => i40_smaller.negate());

    s("Absolute value of a 1-digit number", () => i1_smaller.abs());
    s("Absolute value of a 20-digit number", () => i20_smaller.abs());
    s("Absolute value of a 40-digit number", () => i40_smaller.abs());

    s("Add two 1-digit numbers", () => i1_smaller.add(i1_larger));
    s("Add 20-digit and 1-digit numbers", () => i20_smaller.add(i1_smaller));
    s("Add two 20-digit numbers", () => i20_smaller.add(i20_larger));
    s("Add 40-digit and 20-digit numbers", () => i40_smaller.add(i20_smaller));
    s("Add two 40-digit numbers", () => i40_smaller.add(i40_larger));

    s("Subtract two 1-digit numbers", () => i1_smaller.sub(i1_larger));
    s("Subtract 20-digit and 1-digit numbers", () => i20_smaller.sub(i1_smaller));
    s("Subtract two 20-digit numbers", () => i20_smaller.sub(i20_larger));
    s("Subtract 40-digit and 20-digit numbers", () => i40_smaller.sub(i20_smaller));
    s("Subtract two 40-digit numbers", () => i40_smaller.sub(i40_larger));

    s("Multiply two 1-digit numbers", () => i1_smaller.mul(i1_larger));
    s("Multiply 20-digit and 1-digit numbers", () => i20_smaller.mul(i1_smaller));
    s("Multiply two 20-digit numbers", () => i20_smaller.mul(i20_larger));
    s("Multiply 40-digit and 20-digit numbers", () => i40_smaller.mul(i20_smaller));
    s("Multiply two 40-digit numbers", () => i40_smaller.mul(i40_larger));

    s("Div/rem of two 1-digit numbers", () => i1_smaller.divRem(i1_larger));
    s("Div/rem of 20-digit and 1-digit numbers", () => i20_smaller.divRem(i1_smaller));
    s("Div/rem of two 20-digit numbers", () => i20_larger.divRem(i20_smaller));
    s("Div/rem of 40-digit and 20-digit numbers", () => i40_smaller.divRem(i20_smaller));
    s("Div/rem of two 40-digit numbers", () => i40_larger.divRem(i40_smaller));

    s("Modular inverse of a 1-digit number", () => i1_smaller.modInverse(i1_larger));
    s("Modular inverse a 20-digit number", () => i20_smaller.modInverse(i20_larger));
    s("Modular inverse a 40-digit number", () => i40_smaller.modInverse(i40_larger));

    s("Logical AND of two 1-digit numbers", () => i1_smaller.and(i1_larger));
    s("Logical AND of 20-digit and 1-digit numbers", () => i20_smaller.and(i1_smaller));
    s("Logical AND of two 20-digit numbers", () => i20_smaller.and(i20_larger));
    s("Logical AND of 40-digit and 20-digit numbers", () => i40_smaller.and(i20_smaller));
    s("Logical AND of two 40-digit numbers", () => i40_smaller.and(i40_larger));

    s("Compare two 1-digit numbers", () => i1_smaller.compare(i1_larger));
    s("Compare 20-digit and 1-digit numbers", () => i20_smaller.compare(i1_smaller));
    s("Compare two 20-digit numbers", () => i20_smaller.compare(i20_larger));
    s("Compare 40-digit and 20-digit numbers", () => i40_smaller.compare(i20_smaller));
    s("Compare two 40-digit numbers", () => i40_smaller.compare(i40_larger));

    s("Stringify a 1-digit number", () => i1_smaller.toString());
    s("Stringify a 20-digit number", () => i20_smaller.toString());
    s("Stringify a 40-digit number", () => i40_smaller.toString());
}

function modNumberSuite() {
    var mod1 = BigInteger.parse("9");
    var i1_1 = ModNumber.create(BigInteger.parse("1"), mod1);
    var i1_2 = ModNumber.create(BigInteger.parse("7"), mod1);

    var mod20 = BigInteger.parse("71755440315342536873");
    var i20_1 = ModNumber.create(BigInteger.parse("29497513910652490397"), mod20);
    var i20_2 = ModNumber.create(BigInteger.parse("12345678901234567890"), mod20);

    var mod34 = BigInteger.parse("4451685225093714772084598273548427");
    var i34_1 = ModNumber.create(BigInteger.parse("2061118396808653202902996166388514"), mod34);
    var i34_2 = ModNumber.create(BigInteger.parse("4451685225093714772084598273548427"), mod34);

    var s = BenchmarkSuite.create("ModNumber");

    s("Negate a 1-digit number", () => i1_1.negate());
    s("Negate a 20-digit number", () => i20_1.negate());
    s("Negate a 34-digit number", () => i34_1.negate());

    s("Invert a 1-digit number", () => i1_1.invert());
    s("Invert a 20-digit number", () => i20_1.invert());
    s("Invert a 34-digit number", () => i34_1.invert());

    s("Add two 1-digit numbers", () => i1_1.add(i1_2));
    s("Add two 20-digit numbers", () => i20_1.add(i20_2));
    s("Add two 34-digit numbers", () => i34_1.add(i34_2));

    s("Subtract two 1-digit numbers", () => i1_1.sub(i1_2));
    s("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    s("Subtract two 34-digit numbers", () => i34_1.sub(i34_2));

    s("Multiply two 1-digit numbers", () => i1_1.mul(i1_2));
    s("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    s("Multiply two 34-digit numbers", () => i34_1.mul(i34_2));

    s("Double a 1-digit number", () => i1_1.mulNum(2));
    s("Double a 20-digit number", () => i20_1.mulNum(2));
    s("Double a 34-digit number", () => i34_1.mulNum(2));
    s("Centuple a 1-digit number", () => i1_1.mulNum(100));
    s("Centuple a 20-digit number", () => i20_1.mulNum(100));
    s("Centuple a 34-digit number", () => i34_1.mulNum(100));

    s("Divide two 1-digit numbers", () => i1_1.div(i1_2));
    s("Divide two 20-digit numbers", () => i20_1.div(i20_2));
    s("Divide two 34-digit numbers", () => i34_1.div(i34_2));

    s("Square a 1-digit number", () => i1_1.square());
    s("Square a 20-digit number", () => i20_1.square());
    s("Square a 34-digit number", () => i34_1.square());

    s("Compare two 1-digit numbers", () => i1_1.compare(i1_2));
    s("Compare two 20-digit numbers", () => i20_1.compare(i20_2));
    s("Compare two 34-digit numbers", () => i34_1.compare(i34_2));
}

function modPointSuite() {
    // very simple curve and points generated with Wolfram|Alpha
    var c1 = new ModCurve(BigInteger.parse("2"), BigInteger.parse("1"), BigInteger.parse("9"), BigInteger.parse("0")); // I don't know the order of that curve
    var pSmall_1 = ModPoint.fromBigInts(BigInteger.parse("4"), BigInteger.parse("1"), c1);
    var pSmall_2 = ModPoint.fromBigInts(BigInteger.parse("6"), BigInteger.parse("2"), c1);

    // Certicom 131
    var cBig = new ModCurve(BigInteger.parse("1399267573763578815877905235971153316710"), BigInteger.parse("1009296542191532464076260367525816293976"),
        BigInteger.parse("1550031797834347859248576414813139942411"), BigInteger.parse("1550031797834347859219047037805205710577"));
    var pBig_1 = ModPoint.fromBigInts(BigInteger.parse("1317953763239595888465524145589872695690"), BigInteger.parse("434829348619031278460656303481105428081"), cBig);
    var pBig_2 = ModPoint.fromBigInts(BigInteger.parse("1247392211317907151303247721489640699240"), BigInteger.parse("207534858442090452193999571026315995117"), cBig);

    var s = BenchmarkSuite.create("ModPoint");

    s("Adding a tiny point and infinity", () => pSmall_1.add(ModPoint.INFINITY));
    s("Adding a tiny point and itself", () => pSmall_1.add(pSmall_1));
    s("Adding two tiny points", () => pSmall_1.add(pSmall_2));
    s("Adding a large point and infinity", () => pBig_1.add(ModPoint.INFINITY));
    s("Adding a large point and itself", () => pBig_1.add(pBig_1));
    s("Adding two large points", () => pBig_1.add(pBig_2));

    s("Equality of two tiny points", () => pSmall_1.eq(pSmall_2));
    s("Equality of two large points", () => pBig_1.eq(pBig_2));
}

function pollardRho112Suite() {
    var s = BenchmarkSuite.create("PollardRho (112-bit)");

    var curve = new ModCurve(BigInteger.parse("4451685225093714772084598273548424"), BigInteger.parse("2061118396808653202902996166388514"),
        BigInteger.parse("4451685225093714772084598273548427"), BigInteger.parse("4451685225093714776491891542548933"));
    var gen = ModPoint.fromBigInts(BigInteger.parse("188281465057972534892223778713752"), BigInteger.parse("3419875491033170827167861896082688"), curve);
    var target = ModPoint.fromBigInts(BigInteger.parse("1415926535897932384626433832795028"), BigInteger.parse("3846759606494706724286139623885544"), curve);


    function configWithTableLength(length: number) {
        return {
            additionTableLength: length,
            curve: curve,
            generator: gen,
            target: target,
            additionTableSeed: 0,
            distinguishedPointMask: BigInteger.parse("1"),
            parrallelWalksCount: 1,
            computeStats: false,
            checkCyclePeriod: length * 2,
            checkCycleLength: length
        };
    }

    var config16 = configWithTableLength(16);
    var config64 = configWithTableLength(64);
    var config256 = configWithTableLength(256);
    s("Initialize an addition table with 16 elements", () => new Addition.Table(config16));
    s("Initialize an addition table with 64 elements", () => new Addition.Table(config64));
    s("Initialize an addition table with 256 elements", () => new Addition.Table(config256));

    function configWithParrallelWalkCount(count: number) {
        return {
            additionTableLength: 16,
            curve: curve,
            generator: gen,
            target: target,
            additionTableSeed: 0,
            distinguishedPointMask: BigInteger.parse("4294967295"),
            parrallelWalksCount: count,
            computeStats: false,
            checkCyclePeriod: 32,
            checkCycleLength: 16
        };
    }

    var config_walks1 = configWithParrallelWalkCount(1);
    var config_walks2 = configWithParrallelWalkCount(2);
    var config_walks4 = configWithParrallelWalkCount(4);
    var config_walks8 = configWithParrallelWalkCount(8);
    var config_walks16 = configWithParrallelWalkCount(16);
    var config_walks32 = configWithParrallelWalkCount(32);
    var config_walks64 = configWithParrallelWalkCount(64);
    var config_walks128 = configWithParrallelWalkCount(128);
    var config_walks256 = configWithParrallelWalkCount(256);
    var config_walks512 = configWithParrallelWalkCount(512);
    var config_walks1024 = configWithParrallelWalkCount(1024);
    var table16 = new Addition.Table(config16);
    var table64 = new Addition.Table(config64);
    var table256 = new Addition.Table(config256);
    var walk1_16 = new PollardRho.MultiCurveWalk(config_walks1, table16);
    var walk1_64 = new PollardRho.MultiCurveWalk(config_walks1, table64);
    var walk1_256 = new PollardRho.MultiCurveWalk(config_walks1, table256);
    var walk2_16 = new PollardRho.MultiCurveWalk(config_walks2, table16);
    var walk4_16 = new PollardRho.MultiCurveWalk(config_walks4, table16);
    var walk8_16 = new PollardRho.MultiCurveWalk(config_walks8, table16);
    var walk16_16 = new PollardRho.MultiCurveWalk(config_walks16, table16);
    var walk32_16 = new PollardRho.MultiCurveWalk(config_walks32, table16);
    var walk64_16 = new PollardRho.MultiCurveWalk(config_walks64, table16);
    var walk64_64 = new PollardRho.MultiCurveWalk(config_walks64, table64);
    var walk64_256 = new PollardRho.MultiCurveWalk(config_walks64, table256);
    var walk128_16 = new PollardRho.MultiCurveWalk(config_walks128, table16);
    var walk256_16 = new PollardRho.MultiCurveWalk(config_walks256, table16);
    var walk512_16 = new PollardRho.MultiCurveWalk(config_walks512, table16);
    var walk1024_16 = new PollardRho.MultiCurveWalk(config_walks1024, table16);

    s("Step of a single walk (r = 16)", () => walk1_16.step());
    s("Step of 2 parrallel walks (r = 16)", () => walk2_16.step());
    s("Step of 4 parrallel walks (r = 16)", () => walk4_16.step());
    s("Step of 8 parrallel walks (r = 16)", () => walk8_16.step());
    s("Step of 16 parrallel walks (r = 16)", () => walk16_16.step());
    s("Step of 32 parrallel walks (r = 16)", () => walk32_16.step());
    s("Step of 64 parrallel walks (r = 16)", () => walk64_16.step());
    s("Step of 128 parrallel walks (r = 16)", () => walk128_16.step());
    s("Step of 256 parrallel walks (r = 16)", () => walk256_16.step());
    s("Step of 512 parrallel walks (r = 16)", () => walk512_16.step());
    s("Step of 1024 parrallel walks (r = 16)", () => walk1024_16.step());

    s("1000 steps of a single walk (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk1_16.step();
        }
    });
    s("1000 steps of 2 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk2_16.step();
        }
    });
    s("1000 steps of 4 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk4_16.step();
        }
    });
    s("1000 steps of 8 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk8_16.step();
        }
    });
    s("1000 steps of 16 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk16_16.step();
        }
    });
    s("1000 steps of 32 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk32_16.step();
        }
    });
    s("1000 steps of 64 parrallel walks (r = 16)", () => {
        for (var n = 0; n < 1000; n++) {
            walk64_16.step();
        }
    });

    s("Step of a single walk (r = 64)", () => walk1_64.step());
    s("1000 steps of a single walk (r = 64)", () => {
        for (var n = 0; n < 1000; n++) {
            walk1_64.step();
        }
    });
    s("Step of a single walk (r = 256)", () => walk1_256.step());
    s("1000 steps of a single walk (r = 256)", () => {
        for (var n = 0; n < 1000; n++) {
            walk1_256.step();
        }
    });

    s("Step of 64 parrallel walks (r = 64)", () => walk64_64.step());
    s("1000 steps of 64 parrallel walks (r = 64)", () => {
        for (var n = 0; n < 1000; n++) {
            walk64_64.step();
        }
    });
    s("Step of 64 parrallel walks (r = 256)", () => walk64_256.step());
    s("1000 steps of 64 parrallel walks (r = 256)", () => {
        for (var n = 0; n < 1000; n++) {
            walk64_256.step();
        }
    });
}

function pollardRho131Suite() {
    var s = BenchmarkSuite.create("PollardRho (131-bit)");

    var curve = new ModCurve(BigInteger.parse("1399267573763578815877905235971153316710"), BigInteger.parse("1009296542191532464076260367525816293976"),
        BigInteger.parse("1550031797834347859248576414813139942411"), BigInteger.parse("1550031797834347859219047037805205710577"));
    var gen = ModPoint.fromBigInts(BigInteger.parse("1317953763239595888465524145589872695690"), BigInteger.parse("434829348619031278460656303481105428081"), curve);
    var target = ModPoint.fromBigInts(BigInteger.parse("1247392211317907151303247721489640699240"), BigInteger.parse("207534858442090452193999571026315995117"), curve);

    function configWithParrallelWalkCount(count: number) {
        return {
            additionTableLength: 16,
            curve: curve,
            generator: gen,
            target: target,
            additionTableSeed: 0,
            distinguishedPointMask: BigInteger.parse("4294967295"),
            parrallelWalksCount: count,
            computeStats: false,
            checkCyclePeriod: 32,
            checkCycleLength: 16
        };
    }

    function configWithTableLength(length: number) {
        return {
            additionTableLength: length,
            curve: curve,
            generator: gen,
            target: target,
            additionTableSeed: 0,
            distinguishedPointMask: BigInteger.parse("1"),
            parrallelWalksCount: 1,
            computeStats: false,
            checkCyclePeriod: length * 2,
            checkCycleLength: length
        };
    }

    var config16 = configWithTableLength(16);

    var config_walks1 = configWithParrallelWalkCount(1);
    var config_walks2 = configWithParrallelWalkCount(2);
    var config_walks4 = configWithParrallelWalkCount(4);
    var config_walks8 = configWithParrallelWalkCount(8);
    var config_walks16 = configWithParrallelWalkCount(16);
    var config_walks32 = configWithParrallelWalkCount(32);
    var config_walks64 = configWithParrallelWalkCount(64);
    var config_walks128 = configWithParrallelWalkCount(128);
    var config_walks256 = configWithParrallelWalkCount(256);
    var config_walks512 = configWithParrallelWalkCount(512);
    var config_walks1024 = configWithParrallelWalkCount(1024);
    var table16 = new Addition.Table(config16);
    var walk1_16 = new PollardRho.MultiCurveWalk(config_walks1, table16);
    var walk2_16 = new PollardRho.MultiCurveWalk(config_walks2, table16);
    var walk4_16 = new PollardRho.MultiCurveWalk(config_walks4, table16);
    var walk8_16 = new PollardRho.MultiCurveWalk(config_walks8, table16);
    var walk16_16 = new PollardRho.MultiCurveWalk(config_walks16, table16);
    var walk32_16 = new PollardRho.MultiCurveWalk(config_walks32, table16);
    var walk64_16 = new PollardRho.MultiCurveWalk(config_walks64, table16);
    var walk128_16 = new PollardRho.MultiCurveWalk(config_walks128, table16);
    var walk256_16 = new PollardRho.MultiCurveWalk(config_walks256, table16);
    var walk512_16 = new PollardRho.MultiCurveWalk(config_walks512, table16);
    var walk1024_16 = new PollardRho.MultiCurveWalk(config_walks1024, table16);

    s("Step of a single walk (r = 16)", () => walk1_16.step());
    s("Step of 2 parrallel walks (r = 16)", () => walk2_16.step());
    s("Step of 4 parrallel walks (r = 16)", () => walk4_16.step());
    s("Step of 8 parrallel walks (r = 16)", () => walk8_16.step());
    s("Step of 16 parrallel walks (r = 16)", () => walk16_16.step());
    s("Step of 32 parrallel walks (r = 16)", () => walk32_16.step());
    s("Step of 64 parrallel walks (r = 16)", () => walk64_16.step());
    s("Step of 128 parrallel walks (r = 16)", () => walk128_16.step());
    s("Step of 256 parrallel walks (r = 16)", () => walk256_16.step());
    s("Step of 512 parrallel walks (r = 16)", () => walk512_16.step());
    s("Step of 1024 parrallel walks (r = 16)", () => walk1024_16.step());
}

bigIntegerSuite();
modNumberSuite();
modPointSuite();
pollardRho112Suite();
pollardRho131Suite();