﻿/// <reference path="lib/require.d.ts" />

import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");
import IConfig = require("IConfig");
import PollardRho = require("PollardRho");
import ResultSinks = require("ResultSinks");

function bigintValue(elemName: string): BigInteger {
    return BigInteger.parse((<HTMLInputElement> document.getElementById(elemName)).value);
}

document.getElementById("button").onclick = () => {
    BigInteger.parse("123456789").mod(BigInteger.TWO);


    var a = bigintValue("a"), b = bigintValue("b"), n = bigintValue("order");
    var gx = bigintValue("gx"), gy = bigintValue("gy");
    var hx = bigintValue("hx"), hy = bigintValue("hy");

    var curve = new ModCurve(a, b, n);

    var config: IConfig = {
        curve: curve,
        generator: ModPoint.create(gx, gy, curve),
        target: ModPoint.create(hx, hy, curve),
        additionTableSeed: 0,
        additionTableLength: 128,
        parrallelWalksCount: 10,
        useNegationMap: true, // TODO
        distinguishedPointMask: BigInteger.fromInt(3)
    };

    var sink = ResultSinks.combine(ResultSinks.server(), ResultSinks.debug());

    PollardRho.run(config, sink);
};