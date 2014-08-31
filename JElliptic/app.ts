module ModMath {
    // Non-negative mod
    export function mod(a: number, n: number): number {
        return ((a % n) + n) % n;
    }

    // from http://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
    export function modInverse(a: number, n: number): number {
        var t = 0, newt = 1;
        var r = n, newr = a;
        while (newr != 0) {
            var quotient = Math.floor(r / newr);

            var oldt = t;
            t = newt;
            newt = oldt - quotient * newt;

            var oldr = r;
            r = newr;
            newr = oldr - quotient * newr;
        }
        if (r > 1) {
            throw (a + " is not invertible");
        }
        if (t < 0) {
            t = t + n;
        }
        return t;
    }
}

class ModNum {
    private val: number;
    private n: number;

    constructor(val: number, n: number) {
        this.val = ModMath.mod(val, n);
        this.n = n;
    }

    negate(): ModNum {
        return new ModNum(-this.val, this.n);
    }

    add(other: ModNum): ModNum {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val + other.val, this.n);
    }

    addNum(n: number): ModNum {
        return new ModNum(this.val + n, this.n);
    }

    sub(other: ModNum): ModNum {
        return this.add(other.negate());
    }

    mul(other: ModNum): ModNum {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val * other.val, this.n);
    }

    mulNum(n: number): ModNum {
        return new ModNum(n * this.val, this.n);
    }

    div(other: ModNum): ModNum {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val * ModMath.modInverse(other.val, this.n), this.n);
    }

    pow(n: number): ModNum {
        var result = this;
        for (var _ = 1; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    }

    eq(other: ModNum): boolean {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return this.val == other.val;
    }

    value(): number {
        return this.val;
    }

    // override toString for debugging
    toString(): string {
        return this.val + " mod " + this.n;
    }
}

// Point in an elliptic curve
class ModPoint {
    // y^2 = x^3 + ax + b (mod n)
    private x: ModNum;
    private y: ModNum;
    private a: ModNum;
    private b: ModNum;
    private n: number;

    // Creates a new element from the specified number.
    public static create(x: number, y: number, a: number, b: number, n: number) {
        return ModPoint.createNum(new ModNum(x, n), new ModNum(y, n), new ModNum(a, n), new ModNum(b, n), n);
    }

    private static createNum(x: ModNum, y: ModNum, a: ModNum, b: ModNum, n: number) {
        var p = new ModPoint();
        p.x = x;
        p.y = y;
        p.a = a;
        p.b = b;
        p.n = n;

        if (!y.pow(2).eq(x.pow(3).add(a.mul(p.x)).add(b))) {
            throw (p + " is not a valid point.");
        }

        return p;
    }


    // Adds this element with another
    add(other: ModPoint): ModPoint {
        var lambda: ModNum;
        if (this.eq(other)) {
            // Double
            var num = this.x.pow(2).mulNum(3).add(this.a);
            var denom = this.y.mulNum(2);
            lambda = num.div(denom);
        } else {
            // Add
            var num = other.y.sub(this.y);
            var denom = other.x.sub(this.x);
            lambda = num.div(denom);
        }

        var x = lambda.pow(2).sub(this.x).sub(other.x);
        var y = lambda.mul(this.x.sub(x)).sub(this.y);

        return ModPoint.createNum(x, y, this.a, this.b, this.n);
    }

    mulNum(n: number): ModPoint {
        var g = this;
        for (var _ = 1; _ < n; _++) {
            g = g.add(this);
        }
        return g;
    }

    partition(count: number): number {
        return this.x.value() % count;
    }

    eq(other: ModPoint): boolean {
        return this.x.eq(other.x) && this.y.eq(other.y);
    }

    // Override toString for debugging
    toString(): string {
        return "[Point: (" + this.x.value() + ", " + this.y.value() + ") % " + this.n + " (A = " + this.a.value() + ", B = " + this.b.value() + ")]";
    }
}

// we want to find m such that m*g = h
class Target {
    public g: ModPoint;
    public h: ModPoint;
    public n: number;

    constructor(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number) {
        this.g = ModPoint.create(gx, gy, a, b, n);
        this.h = ModPoint.create(hx, hy, a, b, n);
        this.n = n;
    }
}

// Walk over a curve
class Walk {
    private target: Target;

    // random multipliers
    public u: ModNum;
    public v: ModNum;

    // current point
    public current: ModPoint;

    constructor(target: Target) {
        this.target = target;
        this.setUV(new ModNum(1, target.n), new ModNum(1, target.n));
    }

    step(): Walk {
        var u: ModNum, v: ModNum;
        switch (this.current.partition(3)) {
            case 0:
                u = this.u.mulNum(2);
                v = this.v.mulNum(2);
                break;

            case 1:
                u = this.u.addNum(1);
                v = this.v;
                break;

            case 2:
                u = this.u;
                v = this.v.addNum(1);
                break;
        }

        return new Walk(this.target).setUV(u, v);
    }

    eq(other: Walk): boolean {
        return this.v == other.v && this.u == other.u;
    }

    // Override toString for debugging
    toString(): string {
        return "[Walk: u = " + this.u + ", v = " + this.v + ", current = " + this.current + "]";
    }


    private setUV(u: ModNum, v: ModNum): Walk {
        this.u = u;
        this.v = v;
        this.current = this.target.g.mulNum(u.value()).add(this.target.h.mulNum(v.value()));
        return this;
    }
}

// Simple Pollard's Rho for logarithms implementation
module PollardRho {
    // Find m such that m*g = h
    export function solve(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number): number {
        var target = new Target(gx, gy, hx, hy, a, b, n);

        var tortoise = new Walk(target);
        var hare = new Walk(target);

        for (var step = 1; step < n; step++) {
            tortoise = tortoise.step();

            hare = hare.step().step();

            console.log("Step: " + step);
            console.log("Tortoise: " + tortoise);
            console.log("Hare: " + hare);
            console.log("---");

            if (tortoise.current.eq(hare.current) && !tortoise.eq(hare)) {
                return tortoise.u.sub(hare.u).div(hare.v.sub(tortoise.v)).value();
            }
        }
    }
}

// Gets the value of the input with the specified name, as a number
function intValue(elemName: string): number {
    return parseInt((<HTMLInputElement> document.getElementById(elemName)).value, 10);
}

window.onload = () => {
    var btn = document.getElementById("button");
    var content = document.getElementById("content");

    btn.onclick = _ => {
        var a = intValue("a"), b = intValue("b"), n = intValue("order");
        var gx = intValue("gx"), gy = intValue("gy");
        var hx = intValue("hx"), hy = intValue("hy");

        console.clear();

        var m = PollardRho.solve(gx, gy, hx, hy, a, b, n);
        content.textContent = (m || "Error").toString();
    };
};