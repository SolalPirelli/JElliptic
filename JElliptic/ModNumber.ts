import BigInteger = require("BigInteger");

class ModNumber {
    private _value: BigInteger;
    private _n: BigInteger;


    constructor(value: BigInteger, n: BigInteger) {
        this._value = value.divRem(n)[1];
        this._n = n;
    }


    get value(): BigInteger {
        return this._value;
    }

    get n(): BigInteger {
        return this._n;
    }


    /** O(1) */
    negate(): ModNumber {
        return new ModNumber(this._value.negate(), this._n);
    }

    /** O(log(this.n)^2) */
    invert(): ModNumber {
        return new ModNumber(this._value.modInverse(this._n), this._n);
    }

    /** O(max(this.value.digits, other.value.digits)) */
    add(other: ModNumber): ModNumber {
        return new ModNumber(this._value.add(other._value), this._n);
    }

    /** O(max(this.value.digits, other.value.digits)) */
    sub(other: ModNumber): ModNumber {
        return new ModNumber(this._value.sub(other._value), this._n);
    }

    /** O(max(this.value.digits, other.value.digits)^log_2(3)) */
    mul(other: ModNumber): ModNumber {
        return new ModNumber(this._value.mul(other._value), this._n);
    }

    /** O(this.digits)^log_2(3)) */
    mulNum(n: number): ModNumber {
        return new ModNumber(this._value.mul(BigInteger.fromInt(n)), this._n);
    }

    /** O(log(n)^2 + max(this.value.digits, other.value.digits)^log_2(3)) */
    div(other: ModNumber): ModNumber {
        return new ModNumber(this._value.mul(other._value.modInverse(this._n)), this._n);
    }

    /** O(n * (this.digits ^ log_2(3))) */
    pow(n: number): ModNumber {
        var result = new ModNumber(BigInteger.ONE, this.n);
        for (var _ = 0; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    }

    /** O(min(this.value.digits, other.value.digits)) */
    compare(other: ModNumber): number {
        return this._value.compare(other._value);
    }

    /** O(min(this.value.digits, other.value.digits)) */
    eq(other: ModNumber): boolean {
        return this._value.eq(other._value);
    }

    /** O(this.value.digits + this.n.digits) */
    toString(): string {
        return this._value.toString() + " mod " + this._n.toString();
    }
}

export = ModNumber;