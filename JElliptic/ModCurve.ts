import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

class ModCurve {
    private a: ModNumber;
    private b: ModNumber;
    private n: BigInteger;

    constructor(a: BigInteger, b: BigInteger, n: BigInteger) {
        this.a = new ModNumber(a, n);
        this.b = new ModNumber(b, n);
        this.n = n;
    }

    get A(): ModNumber {
        return this.a;
    }

    get B(): ModNumber {
        return this.b;
    }

    get N(): BigInteger {
        return this.n;
    }


    toString(): string {
        return "y² = x³ + " + this.a.Value + "x + " + this.b.Value + " (mod " + this.n + ")";
    }
}

export = ModCurve;