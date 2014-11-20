/// <reference path="lib/benchmark.d.ts" />
define(["require", "exports"], function(require, exports) {
    var Bench;
    (function (Bench) {
        var _suites = new SuiteCollection();

        function create(suiteName) {
            var suite = _suites.add(suiteName);
            return function (name, func) {
                suite.add(name, func);
            };
        }
        Bench.create = create;

        var SuiteCollection = (function () {
            function SuiteCollection() {
                var _this = this;
                // Add a button to run all suites
                var runButton = document.createElement("button");
                runButton.textContent = "run all suites";
                runButton.onclick = function () {
                    return _this.run();
                };
                document.body.appendChild(runButton);
                document.body.appendChild(document.createElement("br"));
                document.body.appendChild(document.createElement("br"));

                // Create the suites container
                this._suitesContainer = document.createElement("div");
                document.body.appendChild(this._suitesContainer);
            }
            SuiteCollection.prototype.add = function (name) {
                var suite = new Suite(name);
                suite.attach(this._suitesContainer);
                return suite;
            };

            SuiteCollection.prototype.run = function () {
                this._suites.forEach(function (s) {
                    return s.reset();
                });

                // NOPE not parrallel
                this._suites.forEach(function (s) {
                    return s.run();
                });
            };
            return SuiteCollection;
        })();

        var Suite = (function () {
            function Suite(name) {
                this._name = name;
            }
            Suite.prototype.attach = function (parent) {
                var _this = this;
                var container = document.createElement("div");

                // Position the containing element
                container.style.position = "absolute";
                container.style.left = Suite._count * Suite.PANE_WIDTH + "px";
                container.style.top = "0px";
                container.style.maxWidth = Suite.PANE_WIDTH + "px";

                // Increment the instance counter
                Suite._count++;

                // Add the header
                var header = document.createElement("b");
                header.appendChild(document.createTextNode(name));
                container.appendChild(header);
                container.appendChild(document.createElement("br"));

                // Add the status container
                var statusContainer = document.createElement("span");
                container.appendChild(statusContainer);
                container.appendChild(document.createElement("br"));
                container.appendChild(document.createElement("br"));

                // Set the function we'll use to change the status
                this._statusSet = function (text) {
                    return statusContainer.innerText = text;
                };

                // Add a button to run the suite
                var runButton = document.createElement("button");
                runButton.textContent = "run suite";
                runButton.onclick = function () {
                    return _this.run();
                };

                // Set and add the items container
                this._itemsContainer = document.createElement("div");
                container.appendChild(this._itemsContainer);

                // Show the container on the screen
                parent.appendChild(container);
            };

            Suite.prototype.add = function (name, func) {
                new Item(name, func).attach(this._itemsContainer);
            };

            Suite.prototype.reset = function () {
                this._items.forEach(function (i) {
                    return i.reset();
                });
            };

            Suite.prototype.run = function () {
                this.reset();
                this._items.forEach(function (i) {
                    return i.run();
                });
            };
            Suite.PANE_WIDTH = 400;
            Suite._count = 0;
            return Suite;
        })();

        var Item = (function () {
            function Item(name, func) {
                this._name = name;
                this._func = func;
            }
            Item.prototype.attach = function (parent) {
                var _this = this;
                // Create the container
                var container = document.createElement("div");

                // Add the header
                var header = document.createElement("span");
                header.innerText = this._name;
                container.appendChild(header);
                container.appendChild(document.createElement("br"));

                // Add the status container
                var statusContainer = document.createElement("i");
                container.appendChild(statusContainer);
                container.appendChild(document.createElement("br"));

                // Set the function we'll use to change the status
                this._statusSet = function (text) {
                    return statusContainer.innerText = text;
                };

                // Add a button to run the test
                var runButton = document.createElement("button");
                runButton.textContent = "run";
                runButton.onclick = function () {
                    return _this.run();
                };
                container.appendChild(runButton);
                container.appendChild(document.createElement("br"));
                container.appendChild(document.createElement("br"));

                // Show the container on the screen
                parent.appendChild(container);
            };

            Item.prototype.reset = function () {
                this._statusSet("Waiting");
            };

            Item.prototype.run = function () {
                var _this = this;
                this.reset();

                var count = 0;
                new Benchmark(this._name, this._func, {
                    onStart: function () {
                        return _this._statusSet("Running...");
                    },
                    onCycle: function () {
                        count++;
                        _this._statusSet(count + " cycles...");
                    },
                    onError: function () {
                        return _this._statusSet("Error.");
                    },
                    onComplete: function (evt) {
                        // Extract the result :-/
                        _this._statusSet(evt.target.toString().split(' x ')[1]);
                    }
                }).run();
            };
            return Item;
        })();
    })(Bench || (Bench = {}));

    
    return Bench;
});
//# sourceMappingURL=BenchSuite.js.map
