import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import ModCurve = require("ModCurve");

class CurveWalk {
    private problem: DiscreteLogProblem;
    private u: ModNumber;
    private v: ModNumber;
    private current: ModPoint;


    constructor(problem: DiscreteLogProblem, u?: ModNumber, v?: ModNumber) {
        u = u || new ModNumber(1, problem.Curve.N);
        v = v || new ModNumber(1, problem.Curve.N);

        this.problem = problem;
        this.u = u;
        this.v = v;
        this.current = problem.Generator.mul(u).add(problem.Target.mul(v));
    }


    get U(): ModNumber {
        return this.u;
    }

    get V(): ModNumber {
        return this.v;
    }

    get Current(): ModPoint {
        return this.current;
    }


    step(): CurveWalk {
        var u: ModNumber, v: ModNumber;
        switch (this.current.partition(3)) {
            case 0:
                u = this.u.mulNum(2);
                v = this.v.mulNum(2);
                break;

            case 1:
                u = this.u.addNum(1);
                v = this.v;
                break;

            case 2:
                u = this.u;
                v = this.v.addNum(1);
                break;
        }

        return new CurveWalk(this.problem, u, v);
    }

    eq(other: CurveWalk): boolean {
        return this.v.eq(other.v) && this.u.eq(other.u);
    }


    toString(): string {
        return "[" + this.u.Value + "·" + this.problem.Generator + " + " + this.v.Value + "·" + this.problem.Target + " = " + this.current + " on " + this.problem.Curve+ "]";
    }
}

class DiscreteLogProblem {
    private curve: ModCurve;
    private generator: ModPoint;
    private target: ModPoint;

    constructor(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number) {
        this.curve = new ModCurve(a, b, n);
        this.generator = ModPoint.create(gx, gy, this.curve);
        this.target = ModPoint.create(hx, hy, this.curve);
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


    solve(): number {
        var tortoise = new CurveWalk(this);
        var hare = new CurveWalk(this);

        for (var step = 1; step < this.curve.N; step++) {
            tortoise = tortoise.step();

            hare = hare.step().step();

            console.log("Step: " + step);
            console.log("Tortoise: " + tortoise);
            console.log("Hare: " + hare);
            console.log("---");

            if (tortoise.Current.eq(hare.Current) && !tortoise.eq(hare)) {
                return tortoise.U.sub(hare.U).div(hare.V.sub(tortoise.V)).Value;
            }
        }
    }
}

export = DiscreteLogProblem;