"use strict";
define(["require", "exports"], function(require, exports) {
    function value(elemName) {
        return document.getElementById(elemName).value;
    }

    function intValue(elemName) {
        return parseInt(value(elemName));
    }

    function setValue(elemName, value) {
        document.getElementById(elemName).value = value;
    }

    function setSmallCurve() {
        setValue("a", "0");
        setValue("b", "3");
        setValue("n", "31");
        setValue("order", "43");
        setValue("gx", "11");
        setValue("gy", "1");
        setValue("hx", "23");
        setValue("hy", "24");
    }

    function setLargeCurve() {
        setValue("a", "4451685225093714772084598273548424");
        setValue("b", "2061118396808653202902996166388514");
        setValue("n", "4451685225093714772084598273548427");
        setValue("order", "4451685225093714776491891542548933");
        setValue("gx", "188281465057972534892223778713752");
        setValue("gy", "3419875491033170827167861896082688");
        setValue("hx", "1415926535897932384626433832795028");
        setValue("hy", "3846759606494706724286139623885544");
    }

    // Default values
    setSmallCurve();
    setValue("tableSeed", "0");
    setValue("tableLength", "128");
    setValue("walksCount", "1");
    setValue("mask", "0");
    setValue("cycleLength", "256");
    setValue("cyclePeriod", "128");
    setValue("threadsCount", "1");

    document.getElementById("useSmall").onclick = setSmallCurve;
    document.getElementById("useLarge").onclick = setLargeCurve;

    var workers = null;

    function terminateWorkers() {
        if (workers != null) {
            for (var n = 0; n < workers.length; n++) {
                workers[n].terminate();
            }
        }
    }

    document.getElementById("start").onclick = function () {
        var msg = {
            curveA: value("a"),
            curveB: value("b"),
            curveN: value("n"),
            curveOrder: value("order"),
            generatorX: value("gx"),
            generatorY: value("gy"),
            targetX: value("hx"),
            targetY: value("hy"),
            additionTableSeed: intValue("tableSeed"),
            additionTableLength: intValue("tableLength"),
            parrallelWalksCount: intValue("walksCount"),
            distinguishedPointMask: value("mask"),
            computeStats: true,
            checkCycleLength: intValue("cycleLength"),
            checkCyclePeriod: intValue("cyclePeriod")
        };

        terminateWorkers();

        var threadsCount = intValue("threadsCount");
        workers = [];
        for (var n = 0; n < threadsCount; n++) {
            workers[n] = new Worker("worker.js");
        }

        for (var n = 0; n < threadsCount; n++) {
            workers[n].postMessage([msg]);
        }
    };

    document.getElementById("cancel").onclick = terminateWorkers;
});
//# sourceMappingURL=index.js.map
