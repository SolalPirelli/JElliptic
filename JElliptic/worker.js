"use strict";

importScripts("lib/require.js");

// N.B. passing objects around is extremely limited, better use native types

onmessage = function (e) {
    requirejs(["require", "BigInteger", "ModCurve", "ModPoint", "PollardRho", "ResultSinks"],
        function (_, bigInt, modCurve, modPoint, pollardRho, resultSinks) {
            var msg = e.data[0]; // of type IWorkerMessage

            var curve = new modCurve(bigInt.parse(msg.curveA), bigInt.parse(msg.curveB), bigInt.parse(msg.curveN), bigInt.parse(msg.curveOrder));

            var config = {
                curve: curve,
                generator: modPoint.create(bigInt.parse(msg.generatorX), bigInt.parse(msg.generatorY), curve),
                target: modPoint.create(bigInt.parse(msg.targetX), bigInt.parse(msg.targetY), curve),
                additionTableSeed: msg.additionTableSeed,
                additionTableLength: msg.additionTableLength,
                parrallelWalksCount: msg.parrallelWalksCount,
                distinguishedPointMask: bigInt.parse(msg.distinguishedPointMask),
                computeStats: msg.computeStats,
                checkCycleLength: msg.checkCycleLength,
                checkCyclePeriod: msg.checkCyclePeriod
            };

            var sink = resultSinks.debug(); //resultSinks.combine(resultSinks.server(), resultSinks.debug());

            pollardRho.run(config, sink);
        });
}