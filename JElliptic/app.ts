/// <reference path="lib/require.d.ts" />
/// <reference path="lib/biginteger.d.ts" />

import ModCurve = require("ModCurve");
import ModPoint = require("ModPoint");
import IConfig = require("IConfig");
import PollardRho = require("PollardRho");
import ResultSinks = require("ResultSinks");

function bigintValue(elemName: string): BigInteger {
    return new BigInteger((<HTMLInputElement> document.getElementById(elemName)).value);
}

document.getElementById("button").onclick = () => {
    var a = bigintValue("a"), b = bigintValue("b"), n = bigintValue("n"), order=bigintValue("order");
    var gx = bigintValue("gx"), gy = bigintValue("gy");
    var hx = bigintValue("hx"), hy = bigintValue("hy");

    var curve = new ModCurve(a, b, n, order);

    var config: IConfig = {
        curve: curve,
        generator: ModPoint.create(gx, gy, curve),
        target: ModPoint.create(hx, hy, curve),
        additionTableSeed: 0,
        additionTableLength: 128,
        parrallelWalksCount: 10,
        useNegationMap: true,
        distinguishedPointMask: new BigInteger(3)
    };

    var sink = ResultSinks.combine(ResultSinks.server(), ResultSinks.debug());

    PollardRho.run(config, sink);
};