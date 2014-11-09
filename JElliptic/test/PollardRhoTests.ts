/// <reference path="lib/qunit.d.ts" />

import IConfig = require("IConfig");
import PollardRho = require("PollardRho");

function ok(config: IConfig) {
    test("k * " + config.generator + " = " + config.target, () => {
        //PollardRho.run(config)
    });
}