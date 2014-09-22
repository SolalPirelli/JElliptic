import BigInteger = require("BigInteger");

class ModNumber {
    private value: BigInteger;
    private n: BigInteger;


    constructor(value: BigInteger, n: BigInteger) {
        this.value = value.mod(n);
        this.n = n;
    }


    get Value(): BigInteger {
        return this.value;
    }

    get N(): BigInteger {
        return this.n;
    }


    negate(): ModNumber {
        return new ModNumber(this.value.negate(), this.n);
    }

    add(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value.add(other.value), this.n);
    }

    addNum(n: number): ModNumber {
        return new ModNumber(this.value.add(BigInteger.fromInt(n)), this.n);
    }

    sub(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value.sub(other.value), this.n);
    }

    mul(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value.mul(other.value), this.n);
    }

    mulNum(n: number): ModNumber {
        return new ModNumber(this.value.mul(BigInteger.fromInt(n)), this.n);
    }

    div(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this.value.mul(other.value.modInverse(this.n)), this.n);
    }

    pow(n: number): ModNumber {
        var result = new ModNumber(BigInteger.One, this.N);
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
        if (!this.n.eq(other.n)) {
            throw "Incompatible ModNums";
        }
    }
}

export = ModNumber;