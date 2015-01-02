"use strict";

import BigInteger = require("BigInteger");

class ModNumber {
    private _value: BigInteger;
    private _n: BigInteger;

    /** Unsafe: does not do mod operations */
    constructor(value: BigInteger, n: BigInteger) {
        this._value = value;
        this._n = n;
    }

    static create(value: BigInteger, n: BigInteger): ModNumber {
        return new ModNumber(value.divRem(n)[1], n);
    }


    get value(): BigInteger {
        return this._value;
    }

    get n(): BigInteger {
        return this._n;
    }


    /** sub */
    negate(): ModNumber {
        return new ModNumber(this._n.sub(this._value), this._n);
    }

    /** modInverse */
    invert(): ModNumber {
        return new ModNumber(this._value.modInverse(this._n), this._n);
    }

    /** mul */
    square(): ModNumber {
        return ModNumber.create(this._value.mul(this._value), this._n);
    }

    /** add + compare + sub */
    add(other: ModNumber): ModNumber {
        var sum = this._value.add(other._value);
        if (sum.compare(this._n) > -1) {
            sum = sum.sub(this._n);
        }

        return new ModNumber(sum, this._n);
    }

    /** sub + add */
    sub(other: ModNumber): ModNumber {
        var diff = this._value.sub(other._value);
        if (!diff.isPositive) {
            diff = diff.add(this._n);
        }
        return new ModNumber(diff, this._n);
    }

    /** mul */
    mul(other: ModNumber): ModNumber {
        return ModNumber.create(this._value.mul(other._value), this._n);
    }

    /** mul */
    mulNum(n: number): ModNumber {
        return ModNumber.create(this._value.mul(BigInteger.fromInt(n)), this._n);
    }

    /** mul + modInverse */
    div(other: ModNumber): ModNumber {
        return this.mul(other.invert());
    }

    /** compare */
    compare(other: ModNumber): number {
        return this._value.compare(other._value);
    }

    /** eq */
    eq(other: ModNumber): boolean {
        return this._value.compare(other._value) == 0;
    }

    /** toString */
    toString(): string {
        return this._value.toString() + " mod " + this._n.toString();
    }
}

export = ModNumber;