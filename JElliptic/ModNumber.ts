import BigInteger = require("BigInteger");

class ModNumber {
    private _value: BigInteger;
    private _n: BigInteger;


    constructor(value: BigInteger, n: BigInteger) {
        this._value = value.mod(n);
        this._n = n;
    }


    get value(): BigInteger {
        return this._value;
    }

    get n(): BigInteger {
        return this._n;
    }


    negate(): ModNumber {
        return new ModNumber(this._value.negate(), this._n);
    }

    invert(): ModNumber {
        return new ModNumber(this._value.modInverse(this._n), this._n);
    }

    add(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this._value.add(other._value), this._n);
    }

    addNum(n: number): ModNumber {
        return new ModNumber(this._value.add(BigInteger.fromInt(n)), this._n);
    }

    sub(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this._value.sub(other._value), this._n);
    }

    mul(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this._value.mul(other._value), this._n);
    }

    mulNum(n: number): ModNumber {
        return new ModNumber(this._value.mul(BigInteger.fromInt(n)), this._n);
    }

    div(other: ModNumber): ModNumber {
        this.ensureCompatible(other);

        return new ModNumber(this._value.mul(other._value.modInverse(this._n)), this._n);
    }

    pow(n: number): ModNumber {
        var result = new ModNumber(BigInteger.ONE, this.n);
        for (var _ = 0; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    }

    eq(other: ModNumber): boolean {
        this.ensureCompatible(other);

        return this._value.eq(other._value);
    }


    toString(): string {
        return this._value + " mod " + this._n;
    }


    private ensureCompatible(other: ModNumber): void {
        if (!this._n.eq(other._n)) {
            throw "Incompatible ModNums";
        }
    }
}

export = ModNumber;