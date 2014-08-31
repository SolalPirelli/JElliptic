import ModMath = require("ModMath");

class ModNumber {
    private value: number;
    private n: number;


    constructor(value: number, n: number) {
        this.value = ModMath.mod(value, n);
        this.n = n;
    }


    get Value(): number {
        return this.value;
    }

    get N(): number {
        return this.n;
    }


    add(other: ModNumber): ModNumber {
        ModNumber.ensureCompatible(this, other);

        return new ModNumber(this.value + other.value, this.n);
    }

    addNum(n: number): ModNumber {
        return new ModNumber(this.value + n, this.n);
    }

    sub(other: ModNumber): ModNumber {
        ModNumber.ensureCompatible(this, other);

        return new ModNumber(this.value - other.value, this.n);
    }

    mul(other: ModNumber): ModNumber {
        ModNumber.ensureCompatible(this, other);

        return new ModNumber(this.value * other.value, this.n);
    }

    mulNum(n: number): ModNumber {
        return new ModNumber(n * this.value, this.n);
    }

    div(other: ModNumber): ModNumber {
        ModNumber.ensureCompatible(this, other);

        return new ModNumber(this.value * ModMath.modInverse(other.value, this.n), this.n);
    }

    pow(n: number): ModNumber {
        var result = this;
        for (var _ = 1; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    }

    eq(other: ModNumber): boolean {
        ModNumber.ensureCompatible(this, other);

        return this.value == other.value;
    }


    toString(): string {
        return this.value + " mod " + this.n;
    }


    private static ensureCompatible(a: ModNumber, b: ModNumber): void {
        if (a.n != b.n) {
            throw "Incompatible ModNums";
        }
    }
}

export = ModNumber;