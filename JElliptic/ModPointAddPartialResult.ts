"use strict";

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

// either num and denom are set, or result is set
class ModPointAddPartialResult {
    private _num: ModNumber;
    private _denom: ModNumber;
    private _res: ModPoint;

    constructor(num: ModNumber, denom: ModNumber, res: ModPoint) {
        this._num = num;
        this._denom = denom;
        this._res = res;
    }

    get numerator(): ModNumber {
        return this._num;
    }

    get denominator(): ModNumber {
        return this._denom;
    }

    get result(): ModPoint {
        return this._res;
    }
}

export = ModPointAddPartialResult;