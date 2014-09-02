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


    negate(): ModNumber {
        return new ModNumber(-this.value, this.n);
    }

    add(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value + other.value, this.n);
    }

    addNum(n: number): ModNumber {
        return new ModNumber(this.value + n, this.n);
    }

    sub(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value - other.value, this.n);
    }

    mul(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value * other.value, this.n);
    }

    mulNum(n: number): ModNumber {
        return new ModNumber(n * this.value, this.n);
    }

    div(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value * ModMath.modInverse(other.value, this.n), this.n);
    }

    pow(n: number): ModNumber {
        var result = new ModNumber(1, this.N);
        for (var _ = 0; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    }

    eq(other: ModNumber): boolean {
        this.ensureCompatible(other);

        return this.value == other.value;
    }


    toString(): string {
        return this.value + " mod " + this.n;
    }


    private ensureCompatible(other: ModNumber): void {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }
    }
}

export = ModNumber;