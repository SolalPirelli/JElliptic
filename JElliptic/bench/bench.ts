/// <reference path="lib/benchmark.d.ts" />

import BigInteger = require("../BigInteger");

function createSuite(suiteName: string) {
    var container = document.createElement("div");
    document.body.appendChild(container);

    var header = document.createElement("b");
    header.appendChild(document.createTextNode(suiteName));
    container.appendChild(header);
    container.appendChild(document.createElement("br"));

    var infoContainer = document.createElement("span");
    container.appendChild(infoContainer);
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"));

    function setInfoText(text: string): void {
        infoContainer.innerText = text;
    }

    function addResult(evt: Benchmark.Event): void {
        var fullResult = evt.target.toString().split(' x ');
        var name = fullResult[0];
        var result = fullResult[1];

        container.appendChild(document.createTextNode(name));
        container.appendChild(document.createElement("br"));

        var resultContainer = document.createElement("i");
        resultContainer.appendChild(document.createTextNode(result));
        container.appendChild(resultContainer);
        container.appendChild(document.createElement("br"));
    }

    return new Benchmark.Suite(suiteName, {
        onStart: () => setInfoText("Running benchmarks..."),
        onCycle: evt => addResult(evt),
        onComplete: () => setInfoText("Finished.")
    });
}


var i1 = BigInteger.parse("1");

var i20_1 = BigInteger.parse("12345678901234567890");
var i20_2 = BigInteger.parse("99999999999999999999");

var i100_1 = BigInteger.parse("9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210");
var i100_2 = BigInteger.parse("1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");

requirejs([], () => {
    var bi = createSuite("BigInteger");

    bi.add("Create from 1-digit int", () => BigInteger.fromInt(9));
    bi.add("Create from 16-digit int", () => BigInteger.fromInt(9007199254740991));

    bi.add("Parse 1-digit number", () => BigInteger.parse("1"));
    bi.add("Parse 20-digit number", () => BigInteger.parse("1234578901234567890"));
    bi.add("Parse 100-digit number", () => BigInteger.parse("12345789012345678901234578901234567890123457890123456789012345789012345678901234578901234567890"));

    bi.add("Negate a 1-digit number", () => i1.negate());
    bi.add("Negate a 20-digit number", () => i20_1.negate());
    bi.add("Negate a 100-digit number", () => i100_1.negate());

    bi.add("Absolute value of a 1-digit number", () => i1.abs());
    bi.add("Absolute value of a 20-digit number", () => i20_1.abs());
    bi.add("Absolute value of a 100-digit number", () => i100_1.abs());

    bi.add("Add two 1-digit numbers", () => i1.add(i1));
    bi.add("Add a 20-digit number and 1", () => i20_1.add(i1));
    bi.add("Add two 20-digit numbers", () => i20_1.add(i20_2));
    bi.add("Add two 100-digit numbers", () => i100_1.add(i100_2));

    bi.add("Subtract two 1-digit numbers", () => i1.sub(i1));
    bi.add("Subtract a 20-digit number and 1", () => i20_1.sub(i1));
    bi.add("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    bi.add("Subtract two 100-digit numbers", () => i100_1.sub(i100_2));

    bi.add("Multiply two 1-digit numbers", () => i1.mul(i1));
    bi.add("Multiply a 20-digit number and 1", () => i20_1.mul(i1));
    bi.add("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    bi.add("Multiply two 100-digit numbers", () => i100_1.mul(i100_2));

    bi.run({ async: true });
});