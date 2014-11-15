/// <reference path="lib/require.d.ts" />
define(["require", "exports", "BigInteger", "ModCurve", "ModPoint", "PollardRho", "ResultSinks"], function(require, exports, BigInteger, ModCurve, ModPoint, PollardRho, ResultSinks) {
    function bigintValue(elemName) {
        return BigInteger.parse(document.getElementById(elemName).value);
    }

    requirejs([], function () {
        var btn = document.getElementById("button");

        btn.onclick = function (_) {
            var a = bigintValue("a"), b = bigintValue("b"), n = bigintValue("order");
            var gx = bigintValue("gx"), gy = bigintValue("gy");
            var hx = bigintValue("hx"), hy = bigintValue("hy");

            var curve = new ModCurve(a, b, n);

            var config = {
                curve: curve,
                generator: new ModPoint(gx, gy, curve),
                target: new ModPoint(hx, hy, curve),
                additionTableSeed: 0,
                additionTableLength: 128,
                parrallelWalksCount: 10,
                useNegationMap: true,
                distinguishedPointMask: BigInteger.fromInt(3)
            };

            var sink = ResultSinks.combine(ResultSinks.server(), ResultSinks.debug());

            PollardRho.run(config, sink);
        };
    });
});
//# sourceMappingURL=app.js.map
