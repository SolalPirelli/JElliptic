import ModPoint = require("ModPoint");
import ModCurve = require("ModCurve");

class DiscreteLogProblem {
    private curve: ModCurve;
    private generator: ModPoint;
    private target: ModPoint;


    constructor(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number) {
        this.curve = new ModCurve(a, b, n);
        this.generator = new ModPoint(gx, gy, this.curve);
        this.target = new ModPoint(hx, hy, this.curve);
    }


    get Generator(): ModPoint {
        return this.generator;
    }

    get Target(): ModPoint {
        return this.target;
    }

    get Curve(): ModCurve {
        return this.curve;
    }
}

export = DiscreteLogProblem;