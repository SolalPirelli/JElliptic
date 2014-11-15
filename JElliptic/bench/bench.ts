/// <reference path="lib/benchmark.d.ts" />

import BigInteger = require("../BigInteger");

var resultsContainer = <HTMLTableElement> document.getElementById("results");
var infoTextContainer = <HTMLSpanElement>document.getElementById("infoText");

function addResult(result: string): void {
    var row = <HTMLTableRowElement> resultsContainer.insertRow();
    var cell = <HTMLTableCellElement> row.insertCell();
    var text = document.createTextNode(result);
    cell.appendChild(text);
}

function setInfoText(text: string): void {
    infoTextContainer.textContent = text;
}

requirejs([], () => {
    setInfoText("Running tests...");

    new Benchmark.Suite()
        .add("BigInteger: 1 + 1", () => {
            BigInteger.ONE.add(BigInteger.ONE);
        })
        .on("cycle", evt => {
            addResult(evt.target.toString());
        })
        .on("complete", () => {
            setInfoText("Finished");
        })
        .run({ "async": true });
});