/// <reference path="lib/benchmark.d.ts" />
define(["require", "exports", "BigInteger"], function(require, exports, BigInteger) {
    var resultsContainer = document.getElementById("results");
    var infoTextContainer = document.getElementById("infoText");

    function addResult(result) {
        var row = resultsContainer.insertRow();
        var cell = row.insertCell();
        var text = document.createTextNode(result);
        cell.appendChild(text);
    }

    function setInfoText(text) {
        infoTextContainer.textContent = text;
    }

    requirejs([], function () {
        new Benchmark.Suite().add("BigInteger.add(1, 1)", function () {
            BigInteger.ONE.add(BigInteger.ONE);
        }).on("cycle", function (evt) {
            addResult(String(evt.target));
        }).on("completed", function () {
            setInfoText("Finished");
        }).run();
    });
});
//# sourceMappingURL=app.js.map
