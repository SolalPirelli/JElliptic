/// <reference path="lib/qunit.d.ts" />

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import IConfig = require("IConfig");
import IResultSink = require("IResultSink");
import PollardRho = require("PollardRho");

class Result {
    u: ModNumber;
    v: ModNumber;
    p: ModPoint;

    constructor(u: ModNumber, v: ModNumber, p: ModPoint) {
        this.u = u;
        this.v = v;
        this.p = p;
    }
}

class StoreResultSink implements IResultSink {
    results: Result[];

    send(u: ModNumber, v: ModNumber, p: ModPoint): void {
        this.results.push(new Result(u, v, p));
    }
}

class ComputingResultSink implements IResultSink {
    // This class is a massive hack, but we're testing with small numbers, so it'll work
    private map: { [p: string]: Result } = {};

    result: Result = null;

    send(u: ModNumber, v: ModNumber, p: ModPoint): void {
        var ps = p.toString();
        if (this.map[ps] == undefined) {
            this.map[ps] = new Result(u, v, p);
        } else {
            var existingResult = this.map[ps];
        }
    }
}

function exactSteps(name: string, config: IConfig, ...expected: Result[]) {
    test(name, () => {
        var sink = new StoreResultSink();
        PollardRho.run(config, sink);

        equal(sink.results, expected);
    });
}