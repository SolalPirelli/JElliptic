import ModNumber = require("ModNumber");

class ModCurve {
    private a: ModNumber;
    private b: ModNumber;
    private n: number;

    constructor(a: number, b: number, n: number) {
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

    get N(): number {
        return this.n;
    }


    toString(): string {
        return "y² = x³ + " + this.a.Value + "x + " + this.b.Value + " (mod " + this.n + ")";
    }
}

export = ModCurve;