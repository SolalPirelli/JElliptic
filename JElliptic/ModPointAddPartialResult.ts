import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

// either num and denom are set, or result is set
class ModPointAddPartialResult {
    private _num: ModNumber;
    private _denom: ModNumber;
    private _res: ModPoint;


    static fromDivision(num: ModNumber, denom: ModNumber): ModPointAddPartialResult {
        var res = new ModPointAddPartialResult();
        res._num = num;
        res._denom = denom;
        return res;
    }

    static fromResult(result: ModPoint): ModPointAddPartialResult {
        var res = new ModPointAddPartialResult();
        res._res = result;
        return res;
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