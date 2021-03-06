﻿/// <reference path="lib/qunit.d.ts" />

"use strict";

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import ModCurve = require("ModCurve");
import IConfig = require("IConfig");
import IResultSink = require("IResultSink");
import PollardRho = require("PollardRho");

module PollardRhoTests {
    class NonAlgorithmicConfig {
        a: string;
        b: string;
        n: string;
        order: string;
        gx: string;
        gy: string;
        tx: string;
        ty: string;
        expected: string;

        constructor(a: string, b: string, n: string, order: string,
            gx: string, gy: string, tx: string, ty: string,
            expected: string) {
            this.a = a;
            this.b = b;
            this.n = n;
            this.order = order;
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
                if (existingResult.v.compare(v) != 0) {
                    this.result = u.sub(existingResult.u).div(existingResult.v.sub(v));
                }
            }
        }
    }

    function exactSteps(name: string, config: IConfig, ...expected: Result[]) {
        test(name, () => {
            var sink = new StoreResultSink();
            PollardRho.runLimited(config, sink);

            equal(sink.results, expected);
        });
    }

    function result(configName: string,
        points: NonAlgorithmicConfig,
        tableSeed: number, tableLength: number,
        walksCount: number) {
        var sink = new ComputingResultSink();
        var curve = new ModCurve(BigInteger.parse(points.a), BigInteger.parse(points.b), BigInteger.parse(points.n), BigInteger.parse(points.order));
        var config = {
            curve: curve,
            generator: ModPoint.fromBigInts(BigInteger.parse(points.gx), BigInteger.parse(points.gy), curve),
            target: ModPoint.fromBigInts(BigInteger.parse(points.tx), BigInteger.parse(points.ty), curve),
            additionTableSeed: tableSeed,
            additionTableLength: tableLength,
            parrallelWalksCount: walksCount,
            distinguishedPointMask: BigInteger.parse("0"),
            computeStats: false,
            checkCyclePeriod: tableLength,
            checkCycleLength: tableLength
        };

        test(configName + ": " + points.expected + " * " + config.generator + " = " + config.target + " on " + config.curve, () => {
            PollardRho.runLimited(config, sink);
            equal(0, sink.result.compare(ModNumber.create(BigInteger.parse(points.expected), curve.order)));
        });
    }

    export function run(): void {
        QUnit.module("PollardRho");

        var correctResults = [
            new NonAlgorithmicConfig(
                "0", "3", "31", "43", // Curve (A, B, N)
                "11", "1", // Generator (X, Y)
                "23", "24", // Target (X, Y)
                "10") // Expected result
        ];

        correctResults.forEach(r => result("1 walk", r, 0, 64, 1));
        correctResults.forEach(r => result("2 walks", r, 0, 64, 2));
    }
}

export = PollardRhoTests;