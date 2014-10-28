/// <reference path="lib/require.d.ts" />

import BigInteger = require("BigInteger");
import ModCurve = require("ModCurve");
import IConfig = require("IConfig");
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

        var config: IConfig = {
            curve: new ModCurve(a, b, n),
            additionTableSeed: 0,
            additionTableLength: 128,
            parrallelWalksCount: 10,
            useNegationMap: true, // TODO
            distinguishedPointMask: BigInteger.fromInt(3)
        };

        PollardRho.run(gx, gy, hx, hy, config);
    };
});