/// <reference path="lib/biginteger.d.ts" />
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");

interface IConfig {
    curve: ModCurve;
    generator: ModPoint;
    target: ModPoint;
    additionTableSeed: number;
    additionTableLength: number;
    parrallelWalksCount: number;
    distinguishedPointMask: BigInteger;
}

export = IConfig;