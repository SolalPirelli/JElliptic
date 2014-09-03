import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import DiscreteLogProblem = require("DiscreteLogProblem");

module PollardRho {
    // based on the description in http://lacal.epfl.ch/files/content/sites/lacal/files/papers/noan112.pdf
    // as well as http://www.hyperelliptic.org/tanja/SHARCS/slides09/03-bos.pdf
    export function solve(problem: DiscreteLogProblem): number {
        var tortoise = new CurveWalk(problem);
        var hare = new CurveWalk(problem);

        console.clear();

        for (var step = 0; step < problem.Curve.N; step++) {
            tortoise = tortoise.step();

            hare = hare.step().step();

            console.log("Step " + step);
            console.log("Tortoise: " + tortoise);
            console.log("Hare    : " + hare);
            console.log(" ");

            if (tortoise.Current.eq(hare.Current) && !tortoise.B.eq(hare.B)) {
                var log = tortoise.A.sub(hare.A).div(hare.B.sub(tortoise.B));
                var actualTarget = problem.Generator.mul(log);

                if (!problem.Target.eq(actualTarget)) {
                    throw "Incorrect result found. (" + log + ")";
                }

                return log.Value;
            }
        }
        throw "No result found.";
    }

    class CurveWalk {
        private problem: DiscreteLogProblem;
        private a: ModNumber;
        private b: ModNumber;
        private current: ModPoint;


        constructor(problem: DiscreteLogProblem, a?: ModNumber, b?: ModNumber) {
            var order = problem.Generator.getOrder();

            a = a || new ModNumber(0, order);
            b = b || new ModNumber(0, order);

            this.problem = problem;
            this.a = a;
            this.b = b;
            this.current = problem.Generator.mul(a).add(problem.Target.mul(b));
        }


        get A(): ModNumber {
            return this.a;
        }

        get B(): ModNumber {
            return this.b;
        }

        get Current(): ModPoint {
            return this.current;
        }


        step(): CurveWalk {
            var a: ModNumber, b: ModNumber;
            switch (this.current.partition(3)) {
                case 0:
                    a = this.a.addNum(1);
                    b = this.b;
                    break;

                case 1:
                    a = this.a.mulNum(2);
                    b = this.b.mulNum(2);
                    break;

                case 2:
                    a = this.a;
                    b = this.b.addNum(1);
                    break;
            }
            
            return new CurveWalk(this.problem, a, b);
        }


        toString(): string {
            return "[" + this.a.Value + "·" + this.problem.Generator + " + " + this.b.Value + "·" + this.problem.Target + " = " + this.current + " on " + this.problem.Curve + "]";
        }
    }
}

export = PollardRho;