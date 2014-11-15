/// <reference path="lib/benchmark.d.ts" />
define(["require", "exports", "../BigInteger"], function(require, exports, BigInteger) {
    function createSuite(suiteName) {
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

        function setInfoText(text) {
            infoContainer.innerText = text;
        }

        function addResult(evt) {
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
            onStart: function () {
                return setInfoText("Running benchmarks...");
            },
            onCycle: function (evt) {
                return addResult(evt);
            },
            onComplete: function () {
                return setInfoText("Finished.");
            }
        });
    }

    requirejs([], function () {
        var bi = createSuite("BigInteger");

        bi.add("from 1-digit number", function () {
            BigInteger.fromInt(9);
        });

        bi.add("from 16-digit number", function () {
            BigInteger.fromInt(9007199254740991);
        });

        var i1 = BigInteger.parse("1");
        bi.add("parse 1-digit number", function () {
            BigInteger.parse("1");
        });

        bi.add("parse 20-digit number", function () {
            BigInteger.parse("1234578901234567890");
        });

        bi.add("parse 100-digit number", function () {
            BigInteger.parse("12345789012345678901234578901234567890123457890123456789012345789012345678901234578901234567890");
        });

        bi.add("1 + 1", function () {
            i1.add(i1);
        });

        var i10000000000000000000 = BigInteger.parse("10000000000000000000");
        bi.add("20-digit number + 1", function () {
            i10000000000000000000.add(i1);
        });

        var i12345678901234567890 = BigInteger.parse("12345678901234567890");
        var i99999999999999999999 = BigInteger.parse("99999999999999999999");
        bi.add("Addition of 20-digit numbers", function () {
            i12345678901234567890.add(i99999999999999999999);
        });

        var i9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210 = BigInteger.parse("9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210");
        var i1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890 = BigInteger.parse("1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890");
        bi.add("Addition of 100-digit numbers", function () {
            i9876543210987654321098765432109876543210987654321098765432109876543210987654321098765432109876543210.add(i1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890);
        });

        bi.run({ async: true });
    });
});
//# sourceMappingURL=bench.js.map
