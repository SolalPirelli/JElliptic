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


var i1_1 = BigInteger.parse("1");
var i1_2 = BigInteger.parse("9");

var i20_1 = BigInteger.parse("12345678901234567890");
var i20_2 = BigInteger.parse("99999999999999999999");

var i100_1 = BigInteger.parse("1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
var i100_2 = BigInteger.parse("9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210");

requirejs([], () => {
    var bi = createSuite("BigInteger");

    bi.add("Create from 1-digit int", () => BigInteger.fromInt(9));
    bi.add("Create from 16-digit int", () => BigInteger.fromInt(9007199254740991));

    bi.add("Parse 1-digit number", () => BigInteger.parse("1"));
    bi.add("Parse 20-digit number", () => BigInteger.parse("1234578901234567890"));
    bi.add("Parse 100-digit number", () => BigInteger.parse("12345789012345678901234578901234567890123457890123456789012345789012345678901234578901234567890"));

    bi.add("Negate a 1-digit number", () => i1_1.negate());
    bi.add("Negate a 20-digit number", () => i20_1.negate());
    bi.add("Negate a 100-digit number", () => i100_1.negate());

    bi.add("Absolute value of a 1-digit number", () => i1_1.abs());
    bi.add("Absolute value of a 20-digit number", () => i20_1.abs());
    bi.add("Absolute value of a 100-digit number", () => i100_1.abs());

    bi.add("Add two 1-digit numbers", () => i1_1.add(i1_2));
    bi.add("Add 20-digit and 1-digit numbers", () => i20_1.add(i1_1));
    bi.add("Add two 20-digit numbers", () => i20_1.add(i20_2));
    bi.add("Add two 100-digit numbers", () => i100_1.add(i100_2));

    bi.add("Subtract two 1-digit numbers", () => i1_1.sub(i1_2));
    bi.add("Subtract 20-digit and 1-digit numbers", () => i20_1.sub(i1_1));
    bi.add("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    bi.add("Subtract two 100-digit numbers", () => i100_1.sub(i100_2));

    bi.add("Multiply two 1-digit numbers", () => i1_1.mul(i1_2));
    bi.add("Multiply 20-digit and 1-digit numbers", () => i20_1.mul(i1_1));
    bi.add("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    bi.add("Multiply two 100-digit numbers", () => i100_1.mul(i100_2));

    // FIXME: div, mod and modInverse are so incredibly slow they're not worth benchmarking :-/
    //bi.add("Divide two 1-digit numbers", () => i1_1.div(i1_2));
    //bi.add("Divide 20-digit and 1-digit numbers", () => i20_1.div(i1_1));
    //bi.add("Divide two 20-digit numbers", () => i20_1.div(i20_2));
    //bi.add("Divide two 100-digit numbers", () => i100_1.div(i100_2));

    //bi.add("Modulo two 1-digit numbers", () => i1_1.mod(i1_2));
    //bi.add("Modulo 20-digit and 1-digit numbers", () => i20_1.mod(i1_1));
    //bi.add("Modulo two 20-digit numbers", () => i20_1.mod(i20_2));
    //bi.add("Modulo two 100-digit numbers", () => i100_1.mod(i100_2));

    //bi.add("Modular inverse of a 1-digit number", () => i1_1.modInverse(i1_2));
    //bi.add("Modular inverse a 20-digit number", () => i20_1.modInverse(i20_2));
    //bi.add("Modular inverse a 100-digit number", () => i100_1.modInverse(i100_2));

    bi.add("Logical AND of two 1-digit numbers", () => i1_1.and(i1_2));
    bi.add("Logical AND of 20-digit and 1-digit numbers", () => i20_1.and(i1_1));
    bi.add("Logical AND of two 20-digit numbers", () => i20_1.and(i20_2));
    bi.add("Logical AND of 100-digit and 20-digit numbers", () => i100_1.and(i20_1));
    bi.add("Logical AND of two 100-digit numbers", () => i100_1.and(i100_2));

    bi.run({ async: true });
});