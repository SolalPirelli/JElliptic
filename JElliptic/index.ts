import IWorkerMessage = require("IWorkerMessage");

function value(elemName: string): string {
    return (<HTMLInputElement> document.getElementById(elemName)).value;
}

function setValue(elemName: string, value: string): void {
    (<HTMLInputElement> document.getElementById(elemName)).value = value;
}

function setSmallCurve(): void {
    setValue("a", "0");
    setValue("b", "3");
    setValue("n", "31");
    setValue("order", "43");
    setValue("gx", "11");
    setValue("gy", "1");
    setValue("hx", "23");
    setValue("hy", "24");
}

function setLargeCurve(): void {
    setValue("a", "4451685225093714772084598273548424");
    setValue("b", "2061118396808653202902996166388514");
    setValue("n", "4451685225093714772084598273548427");
    setValue("order", "4451685225093714776491891542548933");
    setValue("gx", "188281465057972534892223778713752");
    setValue("gy", "3419875491033170827167861896082688");
    setValue("hx", "1415926535897932384626433832795028");
    setValue("hy", "3846759606494706724286139623885544");
}

setSmallCurve(); // by default

document.getElementById("useSmall").onclick = setSmallCurve;
document.getElementById("useLarge").onclick = setLargeCurve;

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