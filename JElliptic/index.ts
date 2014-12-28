/// <reference path="lib/require.d.ts" />

import IWorkerMessage = require("IWorkerMessage");

function value(elemName: string): string {
    return (<HTMLInputElement> document.getElementById(elemName)).value;
}

var worker: Worker = null;

document.getElementById("start").onclick = () => {
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
        parrallelWalksCount: 1,
        distinguishedPointMask: "0",
        computePointsUniqueFraction: true,
        checkCycleLength: 256,
        checkCyclePeriod: 128
    }

    if (worker != null) {
        worker.terminate();
    }
    worker = new Worker("worker.js");
    worker.postMessage([msg]);
};

document.getElementById("cancel").onclick = () => {
    if (worker != null) {
        worker.terminate();
        worker = null;
    }
};