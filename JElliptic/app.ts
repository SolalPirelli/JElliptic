﻿/// <reference path="lib/require.d.ts" />

import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");
import Config = require("Config");
import PollardRho = require("PollardRho");

function bigintValue(elemName: string): BigInteger {
    return BigInteger.parse((<HTMLInputElement> document.getElementById(elemName)).value);
}

requirejs([], () => {
    var btn = document.getElementById("button");

    btn.onclick = _ => {
        var a = bigintValue("a"), b = bigintValue("b"), n = bigintValue("order");
        var gx = bigintValue("gx"), gy = bigintValue("gy");
        var hx = bigintValue("hx"), hy = bigintValue("hy");

        var config: Config = {
            Curve: new ModCurve(a, b, n),
            AdditionTableSeed: 0,
            AdditionTableLength: 128,
            ParrallelWalksCount: 10,
            UseNegationMap: true, // TODO
            DistinguishedPointMask: BigInteger.fromInt(3)
        };

        PollardRho.run(gx, gy, hx, hy, config);
    };
});