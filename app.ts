/// <reference path="lib/require.d.ts" />

import DiscreteLogProblem = require("DiscreteLogProblem");
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

        var problem = new DiscreteLogProblem(gx, gy, hx, hy, a, b, n);

        var result: any;
        try {
            result = PollardRho.solve(problem);
        } catch (exn) {
            result = exn;
        }

        content.textContent = (result || "Error").toString();
    };
});