import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

// either num and denom are set, or result is set
class ModPointAddPartialResult {
    private num: ModNumber;
    private denom: ModNumber;
    private result: ModPoint;


    static fromDivision(num: ModNumber, denom: ModNumber): ModPointAddPartialResult {
        var res = new ModPointAddPartialResult();
        res.num = num;
        res.denom = denom;
        return res;
    }

    static fromResult(result: ModPoint): ModPointAddPartialResult {
        var res = new ModPointAddPartialResult();
        res.result = result;
        return res;
    }


    get Numerator(): ModNumber {
        return this.num;
    }

    get Denominator(): ModNumber {
        return this.denom;
    }

    get Result(): ModPoint {
        return this.result;
    }
}

export = ModPointAddPartialResult;