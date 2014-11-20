import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

class ModCurve {
    private _a: ModNumber;
    private _b: ModNumber;
    private _n: BigInteger;
    private _order:BigInteger;

    constructor(a: BigInteger, b: BigInteger, n: BigInteger, order: BigInteger) {
        this._a = new ModNumber(a, n);
        this._b = new ModNumber(b, n);
        this._n = n;
        this._order = order;
    }

    get a(): ModNumber {
        return this._a;
    }

    get b(): ModNumber {
        return this._b;
    }

    get n(): BigInteger {
        return this._n;
    }

    get order(): BigInteger {
        return this._order;
    }


    toString(): string {
        return "y² = x³ + " + this._a.value + "x + " + this._b.value + " (mod " + this._n + ")";
    }
}

export = ModCurve;