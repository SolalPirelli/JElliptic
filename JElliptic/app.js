/// <reference path="lib/require.d.ts" />
define(["require", "exports", "ModCurve", "PollardRho"], function(require, exports, ModCurve, PollardRho) {
    function intValue(elemName) {
        return parseInt(document.getElementById(elemName).value, 10);
    }

    requirejs([], function () {
        var btn = document.getElementById("button");
        var content = document.getElementById("content");

        btn.onclick = function (_) {
            var a = intValue("a"), b = intValue("b"), n = intValue("order");
            var gx = intValue("gx"), gy = intValue("gy");
            var hx = intValue("hx"), hy = intValue("hy");

            var config = {
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
});
//# sourceMappingURL=app.js.map
