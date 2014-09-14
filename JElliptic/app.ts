/// <reference path="lib/require.d.ts" />

import ModCurve = require("ModCurve");
import Config = require("Config");
import PollardRho = require("PollardRho");

function intValue(elemName: string): number {
    return parseInt((<HTMLInputElement> document.getElementById(elemName)).value, 10);
}

requirejs([], () => {
    var btn = document.getElementById("button");
    var content = document.getElementById("content");

    btn.onclick = _ => {
        var a = intValue("a"), b = intValue("b"), n = intValue("order");
        var gx = intValue("gx"), gy = intValue("gy");
        var hx = intValue("hx"), hy = intValue("hy");

        var config: Config = {
            Curve: new ModCurve(a, b, n),
            AdditionTableSeed: 1,
            AdditionTableLength: 1024,
            ParrallelWalksCount: 10,
            UseNegationMap: true,
            DistinguishedPointsZeroBitsCount: 10
        };

        var result = PollardRho.solve(gx, gy, hx, hy, config);
        content.textContent = (result || "Error").toString();
    };
});