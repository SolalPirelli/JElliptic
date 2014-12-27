/// <reference path="lib/require.d.ts" />

import IWorkerMessage = require("IWorkerMessage");

function value(elemName: string): string {
    return (<HTMLInputElement> document.getElementById(elemName)).value;
}

document.getElementById("button").onclick = () => {
    var msg: IWorkerMessage = {
        curveA: value("a"),
        curveB: value("b"),
        curveN: value("n"),
        curveOrder: value("order"),
        generatorX: value("gx"),
        generatorY: value("gy"),
        targetX: value("hx"),
        targetY: value("hy"),
        additionTableSeed: 0,
        additionTableLength: 128,
        parrallelWalksCount: 10,
        distinguishedPointMask: "3",
        computePointsUniqueFraction: true
    }
    var worker = new Worker("worker.js");
    worker.postMessage([msg]);
};