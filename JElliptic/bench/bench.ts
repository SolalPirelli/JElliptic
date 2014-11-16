/// <reference path="lib/benchmark.d.ts" />

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");

var SUITE_PANE_WIDTH = 400;
var suites = new Array<Benchmark.Suite>();
var currentSuiteIndex = 0;
function createSuite(suiteName: string): Benchmark.Suite {
    var container = document.createElement("div");
    // HACK: CSS sucks.
    var suitesCount = suites.length;
    container.style.position = "absolute";
    container.style.left = suitesCount * SUITE_PANE_WIDTH + "px";
    container.style.top = "0px";
    container.style.maxWidth = SUITE_PANE_WIDTH + "px";
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

    setInfoText("Waiting...");

    var suite = new Benchmark.Suite(suiteName, {
        onStart: () => setInfoText("Running benchmarks..."),
        onCycle: evt => addResult(evt),
        onComplete: () => {
            setInfoText("Finished.");
            currentSuiteIndex++;
            if (suites.length > currentSuiteIndex) {
                suites[currentSuiteIndex].run({ async: true });
            }
        }
    });

    suites.push(suite);

    return suite;
}

function run(...suites: Benchmark.Suite[]): void {
    suites[0].run({ async: true });
}

function bigIntegerSuite(): Benchmark.Suite {
    var i1_1 = BigInteger.parse("1");
    var i1_2 = BigInteger.parse("9");

    var i20_1 = BigInteger.parse("12345678901234567890");
    var i20_2 = BigInteger.parse("99999999999999999999");

    var i100_1 = BigInteger.parse("1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
    var i100_2 = BigInteger.parse("9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210");

    var s = createSuite("BigInteger");

    s.add("Create from 1-digit int", () => BigInteger.fromInt(9));
    s.add("Create from 16-digit int", () => BigInteger.fromInt(9007199254740991));

    s.add("Parse 1-digit number", () => BigInteger.parse("1"));
    s.add("Parse 20-digit number", () => BigInteger.parse("1234578901234567890"));
    s.add("Parse 100-digit number", () => BigInteger.parse("12345789012345678901234578901234567890123457890123456789012345789012345678901234578901234567890"));

    s.add("Negate a 1-digit number", () => i1_1.negate());
    s.add("Negate a 20-digit number", () => i20_1.negate());
    s.add("Negate a 100-digit number", () => i100_1.negate());

    s.add("Absolute value of a 1-digit number", () => i1_1.abs());
    s.add("Absolute value of a 20-digit number", () => i20_1.abs());
    s.add("Absolute value of a 100-digit number", () => i100_1.abs());

    s.add("Add two 1-digit numbers", () => i1_1.add(i1_2));
    s.add("Add 20-digit and 1-digit numbers", () => i20_1.add(i1_1));
    s.add("Add two 20-digit numbers", () => i20_1.add(i20_2));
    s.add("Add 100-digit and 20-digit numbers", () => i100_1.add(i20_1));
    s.add("Add two 100-digit numbers", () => i100_1.add(i100_2));

    s.add("Subtract two 1-digit numbers", () => i1_1.sub(i1_2));
    s.add("Subtract 20-digit and 1-digit numbers", () => i20_1.sub(i1_1));
    s.add("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    s.add("Subtract 100-digit and 20-digit numbers", () => i100_1.sub(i20_1));
    s.add("Subtract two 100-digit numbers", () => i100_1.sub(i100_2));

    s.add("Multiply two 1-digit numbers", () => i1_1.mul(i1_2));
    s.add("Multiply 20-digit and 1-digit numbers", () => i20_1.mul(i1_1));
    s.add("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    s.add("Multiply 100-digit and 20-digit numbers", () => i100_1.mul(i20_1));
    s.add("Multiply two 100-digit numbers", () => i100_1.mul(i100_2));

    // FIXME: Too slow!
    //s.add("Divide two 1-digit numbers", () => i1_1.div(i1_2));
    //s.add("Divide 20-digit and 1-digit numbers", () => i20_1.div(i1_1));
    //s.add("Divide two 20-digit numbers", () => i20_1.div(i20_2));
    //s.add("Divide 100-digit and 20-digit numbers", () => i100_1.div(i20_1));
    //s.add("Divide two 100-digit numbers", () => i100_1.div(i100_2));

    //s.add("Modulo two 1-digit numbers", () => i1_1.mod(i1_2));
    //s.add("Modulo 20-digit and 1-digit numbers", () => i20_1.mod(i1_1));
    //s.add("Modulo two 20-digit numbers", () => i20_1.mod(i20_2));
    //s.add("Modulo 100-digit and 20-digit numbers", () => i100_1.mod(i20_1));
    //s.add("Modulo two 100-digit numbers", () => i100_1.mod(i100_2));

    //s.add("Modular inverse of a 1-digit number", () => i1_1.modInverse(i1_2));
    //s.add("Modular inverse a 20-digit number", () => i20_1.modInverse(i20_2));
    //s.add("Modular inverse a 100-digit number", () => i100_1.modInverse(i100_2));

    s.add("Logical AND of two 1-digit numbers", () => i1_1.and(i1_2));
    s.add("Logical AND of 20-digit and 1-digit numbers", () => i20_1.and(i1_1));
    s.add("Logical AND of two 20-digit numbers", () => i20_1.and(i20_2));
    s.add("Logical AND of 100-digit and 20-digit numbers", () => i100_1.and(i20_1));
    s.add("Logical AND of two 100-digit numbers", () => i100_1.and(i100_2));

    s.add("Compare two 1-digit numbers", () => i1_1.eq(i1_2));
    s.add("Compare 20-digit and 1-digit numbers", () => i20_1.eq(i1_1));
    s.add("Compare two 20-digit numbers", () => i20_1.eq(i20_2));
    s.add("Compare 100-digit and 20-digit numbers", () => i100_1.eq(i20_1));
    s.add("Compare two 100-digit numbers", () => i100_1.eq(i100_2));

    s.add("Stringify a 1-digit number", () => i1_1.toString());
    s.add("Stringify a 20-digit number", () => i20_1.toString());
    s.add("Stringify a 100-digit number", () => i100_1.toString());

    return s;
}

function modNumberSuite(): Benchmark.Suite {
    var mod1 = BigInteger.parse("9");
    var i1_1 = new ModNumber(BigInteger.parse("1"), mod1);
    var i1_2 = new ModNumber(BigInteger.parse("7"), mod1);

    var mod20 = BigInteger.parse("99999999999999999999");
    var i20_1 = new ModNumber(BigInteger.parse("12345678901234567890"), mod20);
    var i20_2 = new ModNumber(BigInteger.parse("98765432109876543210"), mod20);

    var mod100 = BigInteger.parse("9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999");
    var i100_1 = new ModNumber(BigInteger.parse("1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"), mod100);
    var i100_2 = new ModNumber(BigInteger.parse("9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210"), mod100);

    var s = createSuite("ModNumber");

    s.add("Negate a 1-digit number", () => i1_1.negate());
    s.add("Negate a 20-digit number", () => i20_1.negate());
    s.add("Negate a 100-digit number", () => i100_1.negate());

    // FIXME: Too slow!
    //s.add("Invert a 1-digit number", () => i1_1.invert());
    //s.add("Invert a 20-digit number", () => i20_1.invert());
    //s.add("Invert a 100-digit number", () => i100_1.invert());

    s.add("Add two 1-digit numbers", () => i1_1.add(i1_2));
    s.add("Add two 20-digit numbers", () => i20_1.add(i20_2));
    s.add("Add two 100-digit numbers", () => i100_1.add(i100_2));

    s.add("Subtract two 1-digit numbers", () => i1_1.sub(i1_2));
    s.add("Subtract two 20-digit numbers", () => i20_1.sub(i20_2));
    s.add("Subtract two 100-digit numbers", () => i100_1.sub(i100_2));

    s.add("Multiply two 1-digit numbers", () => i1_1.mul(i1_2));
    s.add("Multiply two 20-digit numbers", () => i20_1.mul(i20_2));
    s.add("Multiply two 100-digit numbers", () => i100_1.mul(i100_2));

    s.add("Double a 1-digit number", () => i1_1.mulNum(2));
    s.add("Double a 20-digit number", () => i20_1.mulNum(2));
    s.add("Double a 100-digit number", () => i100_1.mulNum(2));
    s.add("Centuple a 1-digit number", () => i1_1.mulNum(100));
    s.add("Centuple a 20-digit number", () => i20_1.mulNum(100));
    s.add("Centuple a 100-digit number", () => i100_1.mulNum(100));

    // FIXME: Too slow!
    //s.add("Divide two 1-digit numbers", () => i1_1.div(i1_2));
    //s.add("Divide two 20-digit numbers", () => i20_1.div(i20_2));
    //s.add("Divide two 100-digit numbers", () => i100_1.div(i100_2));

    s.add("Square a 1-digit number", () => i1_1.pow(2));
    s.add("Square a 20-digit number", () => i20_1.pow(2));
    s.add("Square a 100-digit number", () => i100_1.pow(2));
    s.add("Cube a 1-digit number", () => i1_1.pow(3));
    s.add("Cube a 20-digit number", () => i20_1.pow(3));
    s.add("Cube a 100-digit number", () => i100_1.pow(3));

    s.add("Compare two 1-digit numbers", () => i1_1.eq(i1_2));
    s.add("Compare two 20-digit numbers", () => i20_1.eq(i20_2));
    s.add("Compare two 100-digit numbers", () => i100_1.eq(i100_2));

    return s;
}

run(bigIntegerSuite(), modNumberSuite());