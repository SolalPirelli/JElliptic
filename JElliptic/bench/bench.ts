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
    var i1_1 = BigInteger.parse("1");
    var i1_2 = BigInteger.parse("9");

    var i20_1 = BigInteger.parse("12345678901234567890");
    var i20_2 = BigInteger.parse("71755440315342536873");

    var i34_1 = BigInteger.parse("2061118396808653202902996166388514");
    var i34_2 = BigInteger.parse("4451685225093714772084598273548427");

    var s = BenchmarkSuite.create("BigInteger");

    s("Create from 1-digit int", () => BigInteger.fromInt(9));
    s("Create from 16-digit int", () => BigInteger.fromInt(9007199254740991));

    s("Parse 1-digit number", () => BigInteger.parse("1"));
    s("Parse 20-digit number", () => BigInteger.parse("1234578901234567890"));
    s("Parse 34-digit number", () => BigInteger.parse("4451685225093714772084598273548427"));

    s("Negate a 1-digit number", () => i1_1.negate());
    s("Negate a 20-digit number", () => i20_1.negate());
    s("Negate a 34-digit number", () => i34_1.negate());

    s("Absolute value of a 1-digit number", () => i1_1.abs());
    s("Absolute value of a 20-digit number", () => i20_1.abs());
    s("Absolute value of a 34-digit number", () => i34_1.abs());

    s("Add two 1-digit numbers", () => i1_1.add(i1_2));
    s("Add 20-digit and 1-digit numbers", () => i20_1.add(i1_1));
    s("Add two 20-digit numbers", () => i20_1.add(i20_2));
    s("Add 34-digit and 20-digit numbers", () => i34_1.add(i20_1));
    s("Add two 34-digit numbers", () => i34_1.add(i34_2));

    s("Subtract two 1-digit numbers", () => i1_1.sub(i1_2));
    s("Subtract 20-digit and 1-digit numbers", () => i20_1.sub(i1_1));
    s("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    s("Subtract 34-digit and 20-digit numbers", () => i34_1.sub(i20_1));
    s("Subtract two 34-digit numbers", () => i34_1.sub(i34_2));

    s("Multiply two 1-digit numbers", () => i1_1.mul(i1_2));
    s("Multiply 20-digit and 1-digit numbers", () => i20_1.mul(i1_1));
    s("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    s("Multiply 34-digit and 20-digit numbers", () => i34_1.mul(i20_1));
    s("Multiply two 34-digit numbers", () => i34_1.mul(i34_2));

    s("Div/rem of two 1-digit numbers", () => i1_1.divRem(i1_2));
    s("Div/rem of 20-digit and 1-digit numbers", () => i20_1.divRem(i1_1));
    s("Div/rem of two 20-digit numbers", () => i20_1.divRem(i20_2));
    s("Div/rem of 34-digit and 20-digit numbers", () => i34_1.divRem(i20_1));
    s("Div/rem of two 34-digit numbers", () => i34_1.divRem(i34_2));

    s("Modular inverse of a 1-digit number", () => i1_1.modInverse(i1_2));
    s("Modular inverse a 20-digit number", () => i20_1.modInverse(i20_2));
    s("Modular inverse a 34-digit number", () => i34_1.modInverse(i34_2));

    s("Logical AND of two 1-digit numbers", () => i1_1.and(i1_2));
    s("Logical AND of 20-digit and 1-digit numbers", () => i20_1.and(i1_1));
    s("Logical AND of two 20-digit numbers", () => i20_1.and(i20_2));
    s("Logical AND of 34-digit and 20-digit numbers", () => i34_1.and(i20_1));
    s("Logical AND of two 34-digit numbers", () => i34_1.and(i34_2));

    s("Compare two 1-digit numbers", () => i1_1.compare(i1_2));
    s("Compare 20-digit and 1-digit numbers", () => i20_1.compare(i1_1));
    s("Compare two 20-digit numbers", () => i20_1.compare(i20_2));
    s("Compare 34-digit and 20-digit numbers", () => i34_1.compare(i20_1));
    s("Compare two 34-digit numbers", () => i34_1.compare(i34_2));

    s("Stringify a 1-digit number", () => i1_1.toString());
    s("Stringify a 20-digit number", () => i20_1.toString());
    s("Stringify a 34-digit number", () => i34_1.toString());
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

    s("Square a 1-digit number", () => i1_1.pow(2));
    s("Square a 20-digit number", () => i20_1.pow(2));
    s("Square a 34-digit number", () => i34_1.pow(2));
    s("Cube a 1-digit number", () => i1_1.pow(3));
    s("Cube a 20-digit number", () => i20_1.pow(3));
    s("Cube a 34-digit number", () => i34_1.pow(3));

    s("Compare two 1-digit numbers", () => i1_1.eq(i1_2));
    s("Compare two 20-digit numbers", () => i20_1.eq(i20_2));
    s("Compare two 34-digit numbers", () => i34_1.eq(i34_2));
}

function modPointSuite() {
    // very simple curve and points generated with Wolfram|Alpha
    var c1 = new ModCurve(BigInteger.parse("2"), BigInteger.parse("1"), BigInteger.parse("9"), BigInteger.parse("0")); // I don't know the order of that curve
    var pSmall_1 = ModPoint.create(BigInteger.parse("4"), BigInteger.parse("1"), c1);
    var pSmall_2 = ModPoint.create(BigInteger.parse("6"), BigInteger.parse("2"), c1);

    // using the values defined in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    var cBig = new ModCurve(BigInteger.parse("4451685225093714772084598273548424"), BigInteger.parse("2061118396808653202902996166388514"),
        BigInteger.parse("4451685225093714772084598273548427"), BigInteger.parse("4451685225093714776491891542548933"));
    var pBig_1 = ModPoint.create(BigInteger.parse("188281465057972534892223778713752"), BigInteger.parse("3419875491033170827167861896082688"), cBig);
    var pBig_2 = ModPoint.create(BigInteger.parse("1415926535897932384626433832795028"), BigInteger.parse("3846759606494706724286139623885544"), cBig);

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

function pollardRhoSuite() {
    var s = BenchmarkSuite.create("PollardRho");

    var curve = new ModCurve(BigInteger.parse("4451685225093714772084598273548424"), BigInteger.parse("2061118396808653202902996166388514"),
        BigInteger.parse("4451685225093714772084598273548427"), BigInteger.parse("4451685225093714776491891542548933"));
    var gen = ModPoint.create(BigInteger.parse("188281465057972534892223778713752"), BigInteger.parse("3419875491033170827167861896082688"), curve);
    var target = ModPoint.create(BigInteger.parse("1415926535897932384626433832795028"), BigInteger.parse("3846759606494706724286139623885544"), curve);


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
    var config2048 = configWithTableLength(2048);
    s("Initialize an addition table with 16 elements over a 112-bit curve", () => new Addition.Table(config16));
    s("Initialize an addition table with 64 elements over a 112-bit curve", () => new Addition.Table(config64));
    s("Initialize an addition table with 256 elements over a 112-bit curve", () => new Addition.Table(config256));

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
    //var table2048 = new Addition.Table(config2048);
    var walk1_16 = new PollardRho.MultiCurveWalk(config_walks1, table16);
    var walk1_64 = new PollardRho.MultiCurveWalk(config_walks1, table64);
    var walk1_256 = new PollardRho.MultiCurveWalk(config_walks1, table256);
    //var walk1_2048 = new PollardRho.MultiCurveWalk(config_walks1, table2048);
    var walk8_16 = new PollardRho.MultiCurveWalk(config_walks8, table16);
    var walk16_16 = new PollardRho.MultiCurveWalk(config_walks16, table16);
    var walk32_16 = new PollardRho.MultiCurveWalk(config_walks32, table16);
    var walk64_16 = new PollardRho.MultiCurveWalk(config_walks64, table16);
    var walk64_64 = new PollardRho.MultiCurveWalk(config_walks64, table64);
    var walk64_256 = new PollardRho.MultiCurveWalk(config_walks64, table256);
    //var walk64_2048 = new PollardRho.MultiCurveWalk(config_walks64, table2048);
    var walk128_16 = new PollardRho.MultiCurveWalk(config_walks128, table16);
    var walk256_16 = new PollardRho.MultiCurveWalk(config_walks256, table16);
    var walk512_16 = new PollardRho.MultiCurveWalk(config_walks512, table16);
    var walk1024_16 = new PollardRho.MultiCurveWalk(config_walks1024, table16);

    s("Step of a single walk over a 112-bit curve (r = 16)", () => walk1_16.step());
    s("Step of 8 parrallel walks over a 112-bit curve (r = 16)", () => walk8_16.step());
    s("Step of 16 parrallel walks over a 112-bit curve (r = 16)", () => walk16_16.step());
    s("Step of 32 parrallel walks over a 112-bit curve (r = 16)", () => walk32_16.step());
    s("Step of 64 parrallel walks over a 112-bit curve (r = 16)", () => walk64_16.step());
    s("Step of 128 parrallel walks over a 112-bit curve (r = 16)", () => walk128_16.step());
    s("Step of 256 parrallel walks over a 112-bit curve (r = 16)", () => walk256_16.step());
    s("Step of 512 parrallel walks over a 112-bit curve (r = 16)", () => walk512_16.step());
    s("Step of 1024 parrallel walks over a 112-bit curve (r = 16)", () => walk1024_16.step());

    s("100 steps of a single walk over a 112-bit curve (r = 16)", () => {
        for (var n = 0; n < 100; n++) {
            walk1_16.step();
        }
    });
    s("100 steps of 8 parrallel walks over a 112-bit curve (r = 16)", () => {
        for (var n = 0; n < 100; n++) {
            walk8_16.step();
        }
    });
    s("100 steps of 16 parrallel walks over a 112-bit curve (r = 16)", () => {
        for (var n = 0; n < 100; n++) {
            walk16_16.step();
        }
    });
    s("100 steps of 32 parrallel walks over a 112-bit curve (r = 16)", () => {
        for (var n = 0; n < 100; n++) {
            walk32_16.step();
        }
    });
    s("100 steps of 64 parrallel walks over a 112-bit curve (r = 16)", () => {
        for (var n = 0; n < 100; n++) {
            walk64_16.step();
        }
    });

    s("Step of a single walk over a 112-bit curve (r = 64)", () => walk1_64.step());
    s("100 steps of a single walk over a 112-bit curve (r = 64)", () => {
        for (var n = 0; n < 100; n++) {
            walk1_64.step();
        }
    });
    s("Step of a single walk over a 112-bit curve (r = 256)", () => walk1_256.step());
    s("100 steps of a single walk over a 112-bit curve (r = 256)", () => {
        for (var n = 0; n < 100; n++) {
            walk1_256.step();
        }
    });
    //s("Step of a single walk over a 112-bit curve (r = 2048)", () => walk1_2048.step());
    //s("100 steps of a single walk over a 112-bit curve (r = 2048)", () => {
    //    for (var n = 0; n < 100; n++) {
    //        walk1_2048.step();
    //    }
    //});

    s("Step of 64 parrallel walks over a 112-bit curve (r = 64)", () => walk64_64.step());
    s("100 steps of 64 parrallel walks over a 112-bit curve (r = 64)", () => {
        for (var n = 0; n < 100; n++) {
            walk64_64.step();
        }
    });
    s("Step of 64 parrallel walks over a 112-bit curve (r = 256)", () => walk64_256.step());
    s("100 steps of 64 parrallel walks over a 112-bit curve (r = 256)", () => {
        for (var n = 0; n < 100; n++) {
            walk64_256.step();
        }
    });
    //s("Step of 64 parrallel walks over a 112-bit curve (r = 2048)", () => walk64_2048.step());
    //s("100 steps of 64 parrallel walks over a 112-bit curve (r = 2048)", () => {
    //    for (var n = 0; n < 100; n++) {
    //        walk64_2048.step();
    //    }
    //});
}

bigIntegerSuite();
modNumberSuite();
modPointSuite();
pollardRhoSuite();