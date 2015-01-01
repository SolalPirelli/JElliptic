"use strict";

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

interface IResultSink {
    send(u: ModNumber, v: ModNumber, p: ModPoint): void;
}

export = IResultSink;