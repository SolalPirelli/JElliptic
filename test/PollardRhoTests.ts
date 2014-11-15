/// <reference path="lib/qunit.d.ts" />

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import ModCurve = require("ModCurve");
import IConfig = require("IConfig");
import IResultSink = require("IResultSink");
import PollardRho = require("PollardRho");

QUnit.module("PollardRho");

class NonAlgorithmicConfig {
    a: string;
    b: string;
    n: string;
    gx: string;
    gy: string;
    tx: string;
    ty: string;
    expected: string;

    constructor(a: string, b: string, n: string,
        gx: string, gy: string, tx: string, ty: string,
        expected: string) {
        this.a = a;
        this.b = b;
        this.n = n;
        this.gx = gx;
        this.gy = gy;
        this.tx = tx;
        this.ty = ty;
        this.expected = expected;
    }
}

class Result {
    u: ModNumber;
    v: ModNumber;
    p: ModPoint;

    constructor(u: ModNumber, v: ModNumber, p: ModPoint) {
        this.u = u;
        this.v = v;
        this.p = p;
    }
}

class StoreResultSink implements IResultSink {
    results: Result[];

    send(u: ModNumber, v: ModNumber, p: ModPoint): void {
        this.results.push(new Result(u, v, p));
    }
}

class ComputingResultSink implements IResultSink {
    // This class is a massive hack, but we're testing with small numbers, so it'll work
    private _map: { [p: string]: Result } = {};

    result: ModNumber = null;

    send(u: ModNumber, v: ModNumber, p: ModPoint): void {
        var ps = p.toString();
        if (this._map[ps] == undefined) {
            this._map[ps] = new Result(u, v, p);
        } else {
            var existingResult = this._map[ps];
            if (!existingResult.v.eq(v)) {
                this.result = u.sub(existingResult.u).div(existingResult.v.sub(v));
            }
        }
    }
}

function exactSteps(name: string, config: IConfig, ...expected: Result[]) {
    test(name, () => {
        var sink = new StoreResultSink();
        PollardRho.run(config, sink);

        equal(sink.results, expected);
    });
}

function result(configName: string,
    points: NonAlgorithmicConfig,
    tableSeed: number, tableLength: number,
    walksCount: number, useNegationMap: boolean,
    distinguishedMask: string) {
    var sink = new ComputingResultSink();
    var curve = new ModCurve(BigInteger.parse(points.a), BigInteger.parse(points.b), BigInteger.parse(points.n));
    var config = {
        curve: curve,
        generator: new ModPoint(BigInteger.parse(points.gx), BigInteger.parse(points.gy), curve),
        target: new ModPoint(BigInteger.parse(points.tx), BigInteger.parse(points.ty), curve),
        additionTableSeed: tableSeed,
        additionTableLength: tableLength,
        parrallelWalksCount: walksCount,
        useNegationMap: useNegationMap,
        distinguishedPointMask: BigInteger.parse(distinguishedMask)
    };
    var order = BigInteger.fromInt(config.generator.getOrder());

    test(configName + ": " + config.generator + ", " + config.target + " on " + config.curve, () => {
        PollardRho.run(config, sink);
        ok(sink.result.eq(new ModNumber(BigInteger.parse(points.expected), order)));
    });
}

var correctResults = [
    new NonAlgorithmicConfig(
        "0", "3", "31", // Curve (A, B, N)
        "11", "1", // Generator (X, Y)
        "23", "24", // Target (X, Y)
        "10") // Expected result
];

correctResults.forEach(r => result("1 walk", r, 0, 64, 1, true, "1"));
correctResults.forEach(r => result("2 walks", r, 0, 64, 2, true, "1"));