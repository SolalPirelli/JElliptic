/// <reference path="lib/require.d.ts" />
define(["require", "exports", "DiscreteLogProblem"], function(require, exports, DiscreteLogProblem) {
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

            console.clear();

            var problem = new DiscreteLogProblem(gx, gy, hx, hy, a, b, n);
            var result = problem.solve();
            content.textContent = (result || "Error").toString();
        };
    });
});
//# sourceMappingURL=app.js.map
