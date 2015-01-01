"use strict";

import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModCurve = require("ModCurve");
import ModPointAddPartialResult = require("ModPointAddPartialResult");

// N.B.: Ensuring the validity of a point on a curve is simply too slow
//       Unit tests will have to do...

class ModPoint {
    private static INF = new ModPoint();

    private _x: ModNumber;
    private _y: ModNumber;
    private _curve: ModCurve;

    static create(x: BigInteger, y: BigInteger, curve: ModCurve): ModPoint {
        var point = new ModPoint();
        point._x = ModNumber.create(x, curve.n);
        point._y = ModNumber.create(y, curve.n);
        point._curve = curve;
        return point;
    }

    get x(): ModNumber {
        return this._x;
    }

    get y(): ModNumber {
        return this._y;
    }

    get curve(): ModCurve {
        return this._curve;
    }

    static get INFINITY(): ModPoint {
        return ModPoint.INF;
    }


    /** O(1) */
    negate(): ModPoint {
        if (this == ModPoint.INF) {
            return this;
        }
        return ModPoint.fromModNumbers(this._x, this._y.negate(), this._curve);
    }

    add(other: ModPoint): ModPoint {
        // Case 1: One of the points is infinity -> return the other
        if (this == ModPoint.INF) {
            return other;
        }
        if (other == ModPoint.INF) {
            return this;
        }

        // Case 2: The points are vertically symmetric -> return infinity
        if (this._x.eq(other._x) && this._y.eq(other._y.negate())) {
            return ModPoint.INF;
        }

        var num: ModNumber, denom: ModNumber;
        if (this.eq(other)) {
            // Case 3: The points are equal -> double the current point
            num = this._x.pow(2).mulNum(3).add(this._curve.a);
            denom = this._y.mulNum(2);
        } else {
            // Case 4: Add the two points
            num = other._y.sub(this._y);
            denom = other._x.sub(this._x);
        }

        var lambda = num.div(denom);

        var x = lambda.pow(2).sub(this._x).sub(other._x);
        var y = lambda.mul(this._x.sub(x)).sub(this._y);

        return ModPoint.fromModNumbers(x, y, this._curve);
    }

    beginAdd(other: ModPoint): ModPointAddPartialResult {
        // Case 1: One of the points is infinity -> return the other
        if (this == ModPoint.INF) {
            return ModPointAddPartialResult.fromResult(other);
        }
        if (other == ModPoint.INF) {
            return ModPointAddPartialResult.fromResult(this);
        }

        // Case 2: The points are vertically symmetric -> return infinity
        if (this._x.eq(other._x) && this._y.eq(other._y.negate())) {
            return ModPointAddPartialResult.fromResult(ModPoint.INF);
        }

        var num: ModNumber, denom: ModNumber;
        if (this.eq(other)) {
            // Case 3: The points are equal -> double the current point
            num = this._x.pow(2).mulNum(3).add(this._curve.a);
            denom = this._y.mulNum(2);
        } else {
            // Case 4: Add the two points
            num = other._y.sub(this._y);
            denom = other._x.sub(this._x);
        }

        return ModPointAddPartialResult.fromDivision(num, denom);
    }

    endAdd(other: ModPoint, lambda: ModNumber): ModPoint {
        var x = lambda.pow(2).sub(this._x).sub(other._x);
        var y = lambda.mul(this._x.sub(x)).sub(this._y);

        return ModPoint.fromModNumbers(x, y, this._curve);
    }

    /** O(n) */
    mulNum(n: number): ModPoint {
        var result = ModPoint.INF;
        var currentAdding = this;

        while (n != 0) {
            if ((n & 1) == 1) {
                result = result.add(currentAdding);
            }

            n >>= 1;
            if (n != 0) {
                // This is expensive, don't do it if we're not going to use it
                currentAdding = currentAdding.add(currentAdding);
            }
        }

        return result;
    }

    /** O(this.value.digits / n) */
    partition(n: number): number {
        if (this == ModPoint.INF) {
            return 0;
        }
        return this._x.value.partition(n);
    }

    compareY(other: ModPoint): number {
        if (this == ModPoint.INF) {
            return other == ModPoint.INF ? 0 : 1;
        }
        if (other == ModPoint.INF) {
            return -1;
        }

        return this._y.compare(other._y);
    }

    /** O(min(this.x.value.digits, other.x.value.digits) + min(this.y.value.digits, other.y.value.digits)) */
    eq(other: ModPoint): boolean {
        if (this == ModPoint.INF) {
            return other == ModPoint.INF;
        }
        if (other == ModPoint.INF) {
            return false;
        }

        return this._x.eq(other._x) && this._y.eq(other._y);
    }

    /** O(this.x.value.digits + this.y.value.digits) */
    toString(): string {
        if (this == ModPoint.INF) {
            return "Infinity";
        }
        return "(" + this._x.value.toString() + ", " + this._y.value.toString() + ")";
    }

    private static fromModNumbers(x: ModNumber, y: ModNumber, curve: ModCurve) {
        var point = new ModPoint();
        point._x = x;
        point._y = y;
        point._curve = curve;
        return point;
    }
}

export = ModPoint;