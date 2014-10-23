﻿import BigInteger = require("BigInteger");
import ModNumber = require("ModNumber");
import ModCurve = require("ModCurve");
import ModPointAddPartialResult = require("ModPointAddPartialResult");

class ModPoint {
    private static INF = new ModPoint(BigInteger.ZERO, BigInteger.ZERO, null);

    private _x: ModNumber;
    private _y: ModNumber;
    private _curve: ModCurve;

    constructor(x: BigInteger, y: BigInteger, curve: ModCurve) {
        if (curve == null) {
            return; // hack-y
        }

        this._x = new ModNumber(x, curve.n);
        this._y = new ModNumber(y, curve.n);
        this._curve = curve;

        this.ensureValid();
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

        return new ModPoint(x.value, y.value, this._curve);
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

        return new ModPoint(x.value, y.value, this._curve);
    }

    mulNum(n: BigInteger): ModPoint {
        var g = ModPoint.INF;
        for (var _ = BigInteger.ZERO; _.lt(n); _ = _.add(BigInteger.ONE)) {
            g = g.add(this);
        }
        return g;
    }

    partition(count: number): number {
        if (this == ModPoint.INF) {
            return 0;
        }
        return this._x.value.mod(BigInteger.fromInt(count)).toInt();
    }

    getOrder(): number {
        var point: ModPoint = ModPoint.INF;
        for (var order = 1; ; order++) {
            point = point.add(this);
            if (point.eq(ModPoint.INF)) {
                return order;
            }
        }

        throw "No order found.";
    }

    eq(other: ModPoint): boolean {
        if (this == ModPoint.INF) {
            return other == ModPoint.INF;
        }
        if (other == ModPoint.INF) {
            return false;
        }

        return this._x.eq(other._x) && this._y.eq(other._y);
    }


    toString(): string {
        if (this == ModPoint.INF) {
            return "Infinity";
        }
        return "(" + this._x.value + ", " + this._y.value + ")";
    }


    private ensureValid(): void {
        if (!this._y.pow(2).eq(this._x.pow(3).add(this._curve.a.mul(this._x)).add(this._curve.b))) {
            throw (this + " is not a valid point.");
        }
    }
}

export = ModPoint;