/// <reference path="lib/require.d.ts" />
define(["require", "exports", "DiscreteLogProblem", "PollardRho"], function(require, exports, DiscreteLogProblem, PollardRho) {
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

            var problem = new DiscreteLogProblem(gx, gy, hx, hy, a, b, n);

            var config = {
                additionTableSeed: 1,
                additionTableLength: 1024,
                parrallelWalksCount: 10,
                useNegationMap: true,
                distinguishedPointsZeroBitsCount: 10
            };

            var result = PollardRho.solve(problem, config);
            content.textContent = (result || "Error").toString();
        };
    });
});
//# sourceMappingURL=app.js.map
