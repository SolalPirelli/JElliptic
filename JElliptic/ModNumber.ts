"use strict";

import BigInteger = require("BigInteger");

// TODO try to eliminate usages of create() here, make stuff smarter

class ModNumber {
    private _value: BigInteger;
    private _n: BigInteger;


    static create(value: BigInteger, n: BigInteger): ModNumber {
        var modNum = new ModNumber();
        modNum._value = value.divRem(n)[1];
        modNum._n = n;
        return modNum;
    }

    private static createUnchecked(value: BigInteger, n: BigInteger): ModNumber {
        var modNum = new ModNumber();
        modNum._value = value;
        modNum._n = n;
        return modNum;
    }


    get value(): BigInteger {
        return this._value;
    }

    get n(): BigInteger {
        return this._n;
    }


    /** sub */
    negate(): ModNumber {
        return ModNumber.createUnchecked(this._n.sub(this._value), this._n);
    }

    /** modInverse */
    invert(): ModNumber {
        return ModNumber.createUnchecked(this._value.modInverse(this._n), this._n);
    }

    /** add + compare + sub */
    add(other: ModNumber): ModNumber {
        var sum = this._value.add(other._value);
        if (sum.compare(this._n) > -1) {
            sum = sum.sub(this._n);
        }

        return ModNumber.createUnchecked(sum, this._n);
    }

    /** sub + add */
    sub(other: ModNumber): ModNumber {
        var diff = this._value.sub(other._value);
        if (!diff.isPositive) {
            diff = diff.add(this._n);
        }
        return ModNumber.createUnchecked(diff, this._n);
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
        return ModNumber.create(this._value.mul(other._value.modInverse(this._n)), this._n);
    }

    /** mul * n */
    pow(n: number): ModNumber {
        var result = BigInteger.ONE;
        for (var _ = 0; _ < n; _++) {
            result = result.mul(this._value).divRem(this._n)[1];
        }
        return ModNumber.createUnchecked(result, this._n);
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