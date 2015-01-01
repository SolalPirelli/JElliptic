/// <reference path="lib/benchmark.d.ts" />

"use strict";

module BenchmarkSuite {
    var hasInit = false;
    var suites = new Array<Suite>();
    var suitesContainer: HTMLElement;

    export function create(suiteName: string): (name: string, func: () => any) => void {
        if (!hasInit) {
            init();
        }

        var suite = add(suiteName);
        return (name, func) => {
            suite.add(name, func);
        }
    }

    function init() {
        // Add a button to run all suites
        var runButton = document.createElement("button");
        runButton.innerText = "run all suites";
        runButton.onclick = () => {
            suites.forEach(s => s.reset());
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

    function add(name: string): Suite {
        var suite = new Suite(name);
        suite.attach(suitesContainer);
        suites.push(suite);
        return suite;
    }

    function run(index: number): void {
        if (index < suites.length) {
            suites[index].run(0, () => {
                run(index + 1);
            });
        }
    }

    class Suite {
        private static PANE_WIDTH = 400;
        private static PANE_TOP = 50;
        private static PANE_LEFT = 10;

        private static _count = 0;

        private _name: string;
        private _statusSet: (text: string) => void;
        private _items = new Array<SuiteItem>();
        private _itemsContainer: HTMLElement;


        constructor(name: string) {
            this._name = name;
        }

        attach(parent: HTMLElement) {
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
            runButton.onclick = () => {
                this.reset();
                this.run(0, () => { });
            };
            container.appendChild(runButton);
            container.appendChild(document.createElement("br"));

            // Add the status container
            var statusContainer = document.createElement("span");
            container.appendChild(statusContainer);
            container.appendChild(document.createElement("br"));
            container.appendChild(document.createElement("br"));

            // Set the function we'll use to change the status
            this._statusSet = (text) => statusContainer.innerText = text;

            // Set and add the items container
            this._itemsContainer = document.createElement("div");
            container.appendChild(this._itemsContainer);

            // Show the container on the screen
            parent.appendChild(container);
        }

        add(name: string, func: () => any) {
            var item = new SuiteItem(name, func);
            item.attach(this._itemsContainer);
            this._items.push(item);
        }

        reset() {
            this._statusSet("Waiting");
            this._items.forEach(i => i.reset());
        }

        run(index: number, callback: () => void) {
            if (index == 0) {
                this._statusSet("Running...");
            }
            if (index < this._items.length) {
                this._items[index].run(() => {
                    this.run(index + 1, callback);
                });
            } else {
                this._statusSet("Finished");
                callback();
            }
        }
    }

    class SuiteItem {
        private _name: string;
        private _func: () => any;
        private _statusSet: (text: string) => void;

        constructor(name: string, func: () => any) {
            this._name = name;
            this._func = func;
        }

        attach(parent: HTMLElement) {
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
            runButton.onclick = () => {
                this.reset();
                this.run(() => { });
            };
            container.appendChild(runButton);
            container.appendChild(document.createElement("br"));

            // Add the status container
            var statusContainer = document.createElement("i");
            container.appendChild(statusContainer);
            container.appendChild(document.createElement("br"));
            container.appendChild(document.createElement("br"));

            // Set the function we'll use to change the status
            this._statusSet = (text) => statusContainer.innerText = text;


            // Show the container on the screen
            parent.appendChild(container);
        }

        reset(): void {
            this._statusSet("Waiting");
        }

        run(callback: () => void): void {
            var count = 0;
            new Benchmark(this._name, this._func, {
                async: true,
                onStart: () => this._statusSet(""),
                onCycle: () => {
                    count++;
                    this._statusSet(new Array(Math.floor(count / 2)).join("."));
                },
                onError: () => this._statusSet("Error."),
                onComplete: evt => {
                    this._statusSet(evt.target.toString().split(' x ')[1]); // Extract the result :-/
                    callback();
                }
            }).run();
        }
    }
}

export = BenchmarkSuite;