"use strict";

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

class ModCurve {
    private _a: ModNumber;
    private _b: ModNumber;
    private _order:BigInteger;

    constructor(a: BigInteger, b: BigInteger, n: BigInteger, order: BigInteger) {
        this._a = ModNumber.create(a, n);
        this._b = ModNumber.create(b, n);
        this._order = order;
    }

    get a(): ModNumber {
        return this._a;
    }

    get b(): ModNumber {
        return this._b;
    }

    get n(): BigInteger {
        return this._a.n;
    }

    get order(): BigInteger {
        return this._order;
    }


    toString(): string {
        return "y² = x³ + " + this.a.value + "x + " + this.b.value + " (mod " + this.n + ")";
    }
}

export = ModCurve;