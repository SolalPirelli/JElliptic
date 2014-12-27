/// <reference path="lib/benchmark.d.ts" />
define(["require", "exports"], function(require, exports) {
    var BenchmarkSuite;
    (function (BenchmarkSuite) {
        var hasInit = false;
        var suites = new Array();
        var suitesContainer;

        function create(suiteName) {
            if (!hasInit) {
                init();
            }

            var suite = add(suiteName);
            return function (name, func) {
                suite.add(name, func);
            };
        }
        BenchmarkSuite.create = create;

        function init() {
            // Add a button to run all suites
            var runButton = document.createElement("button");
            runButton.innerText = "run all suites";
            runButton.onclick = function () {
                suites.forEach(function (s) {
                    return s.reset();
                });
                run(0);
            };
            document.body.appendChild(runButton);
            document.body.appendChild(document.createElement("br"));
            document.body.appendChild(document.createElement("br"));

            // Create the suites container
            suitesContainer = document.createElement("div");
            document.body.appendChild(suitesContainer);

            hasInit = true;
        }

        function add(name) {
            var suite = new Suite(name);
            suite.attach(suitesContainer);
            suites.push(suite);
            return suite;
        }

        function run(index) {
            if (index < suites.length) {
                suites[index].run(0, function () {
                    run(index + 1);
                });
            }
        }

        var Suite = (function () {
            function Suite(name) {
                this._items = new Array();
                this._name = name;
            }
            Suite.prototype.attach = function (parent) {
                var _this = this;
                var container = document.createElement("div");

                // Position the containing element
                container.style.position = "absolute";
                container.style.left = Suite.PANE_LEFT + Suite._count * Suite.PANE_WIDTH + "px";
                container.style.top = Suite.PANE_TOP + "px";
                container.style.width = Suite.PANE_WIDTH + "px";

                // Increment the instance counter
                Suite._count++;

                // Add the header
                var header = document.createElement("b");
                header.innerHTML = this._name + "&nbsp;&nbsp;&nbsp;"; // poor man's spacing
                container.appendChild(header);

                // Add a button to run the suite
                var runButton = document.createElement("a");
                runButton.text = "run";
                runButton.href = "javascript:;"; // force the browser to use the default style for links
                runButton.onclick = function () {
                    _this.reset();
                    _this.run(0, function () {
                    });
                };
                container.appendChild(runButton);
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

                // Set and add the items container
                this._itemsContainer = document.createElement("div");
                container.appendChild(this._itemsContainer);

                // Show the container on the screen
                parent.appendChild(container);
            };

            Suite.prototype.add = function (name, func) {
                var item = new SuiteItem(name, func);
                item.attach(this._itemsContainer);
                this._items.push(item);
            };

            Suite.prototype.reset = function () {
                this._statusSet("Waiting");
                this._items.forEach(function (i) {
                    return i.reset();
                });
            };

            Suite.prototype.run = function (index, callback) {
                var _this = this;
                if (index == 0) {
                    this._statusSet("Running...");
                }
                if (index < this._items.length) {
                    this._items[index].run(function () {
                        _this.run(index + 1, callback);
                    });
                } else {
                    this._statusSet("Finished");
                    callback();
                }
            };
            Suite.PANE_WIDTH = 400;
            Suite.PANE_TOP = 50;
            Suite.PANE_LEFT = 10;

            Suite._count = 0;
            return Suite;
        })();

        var SuiteItem = (function () {
            function SuiteItem(name, func) {
                this._name = name;
                this._func = func;
            }
            SuiteItem.prototype.attach = function (parent) {
                var _this = this;
                // Create the container
                var container = document.createElement("div");

                // Add the header
                var header = document.createElement("span");
                header.innerHTML = this._name + "&nbsp;&nbsp;&nbsp;"; // poor man's spacing
                container.appendChild(header);

                // Add an hyperlink to run the test
                var runButton = document.createElement("a");
                runButton.text = "run";
                runButton.href = "javascript:;"; // forces the browser to use the default style for links
                runButton.onclick = function () {
                    _this.reset();
                    _this.run(function () {
                    });
                };
                container.appendChild(runButton);
                container.appendChild(document.createElement("br"));

                // Add the status container
                var statusContainer = document.createElement("i");
                container.appendChild(statusContainer);
                container.appendChild(document.createElement("br"));
                container.appendChild(document.createElement("br"));

                // Set the function we'll use to change the status
                this._statusSet = function (text) {
                    return statusContainer.innerText = text;
                };

                // Show the container on the screen
                parent.appendChild(container);
            };

            SuiteItem.prototype.reset = function () {
                this._statusSet("Waiting");
            };

            SuiteItem.prototype.run = function (callback) {
                var _this = this;
                var count = 0;
                new Benchmark(this._name, this._func, {
                    async: true,
                    onStart: function () {
                        return _this._statusSet("");
                    },
                    onCycle: function () {
                        count++;
                        _this._statusSet(new Array(Math.floor(count / 2)).join("."));
                    },
                    onError: function () {
                        return _this._statusSet("Error.");
                    },
                    onComplete: function (evt) {
                        _this._statusSet(evt.target.toString().split(' x ')[1]); // Extract the result :-/
                        callback();
                    }
                }).run();
            };
            return SuiteItem;
        })();
    })(BenchmarkSuite || (BenchmarkSuite = {}));

    
    return BenchmarkSuite;
});
//# sourceMappingURL=BenchmarkSuite.js.map
