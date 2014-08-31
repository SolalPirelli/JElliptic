// Logs debugging messages
module Debug {
    export function clear() {
        document.getElementById("log").innerHTML = "";
    }

    export function log(str: string) {
        var elem = document.getElementById("log");

        var span = document.createElement("span");
        span.textContent = str;

        var br = document.createElement("br");

        elem.appendChild(span);
        elem.appendChild(br);
    }
}

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
            alert(a + " is not invertible");
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
        return new ModNum(-this.value, this.n);
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

        return this.value == other.value;
    }

    value(): number {
        return this.val;
    }

    // override toString for debugging
    toString(): string {
        return "[" + this.value + " mod " + this.n + "]";
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

        if (!y.pow(2).eq(x.pow(3).add(a.mul(p.x)).add(b))) {
            Debug.log("!!! ERROR: " + p + " is not a valid point !!!");
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

    mulNum(c: number): ModPoint {
        var g = this;
        for (var n = 1; n < c; n++) {
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
        return "[" + this.x.value() + ", " + this.y.value() + "] % " + this.n + "(A = " + this.a.value() + ", B = " + this.b.value() + ")";
    }
}

// Walk over G
class Walk {
    // we want to find m such that m*g = h
    private g: ModPoint;
    private h: ModPoint;

    // random multipliers
    public u: ModNum;
    public v: ModNum;

    // current value
    public p: ModPoint;


    public static create(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number): Walk {
        var w = new Walk();
        w.g = ModPoint.create(gx, gy, a, b, n);
        w.h = ModPoint.create(hx, hy, a, b, n);
        w.u = new ModNum(1, n);
        w.v = new ModNum(0, n);
        w.p = w.g;
        return w;
    }

    private static createNum(g: ModPoint, h: ModPoint, u: ModNum, v: ModNum): Walk {
        var w = new Walk();
        w.g = g;
        w.h = h;
        w.u = u;
        w.v = v;
        w.p = g.mulNum(u.value()).add(h.mulNum(v.value()));
        return w;
    }


    step(): Walk {
        var u: ModNum, v: ModNum;
        switch (this.p.partition(3)) {
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

        return Walk.createNum(this.g, this.h, u, v);
    }

    eq(other: Walk): boolean {
        return this.v == other.v && this.u == other.u;
    }

    // Override toString for debugging
    toString(): string {
        return "[Walk: u = " + this.u + ", v = " + this.v + ", p = " + this.p + "]";
    }
}

// Simple Pollard's Rho for logarithms implementation
module PollardRho {
    // Find m such that m*g = h
    export function solve(gx: number, gy: number, hx: number, hy: number, a: number, b: number, n: number): number {
        var tortoise = Walk.create(gx, gy, hx, hy, a, b, n);
        var hare = tortoise;

        for (var step = 1; step < n; step++) {
            tortoise = tortoise.step();

            hare = hare.step().step();

            Debug.log("Step: " + step);
            Debug.log("Tortoise: " + tortoise);
            Debug.log("Hare: " + hare);
            Debug.log("---");

            if (tortoise.p.eq(hare.p) && !tortoise.eq(hare)) {
                return tortoise.u.sub(hare.u).div(hare.v.sub(tortoise.v)).value();
            }
        }
    }
}

// Gets the value of the input with the specified name, as a number
function numberValue(elemName: string): number {
    return (<HTMLInputElement> document.getElementById(elemName)).valueAsNumber;
}

window.onload = () => {
    var btn = document.getElementById("button");
    var content = document.getElementById("content");

    btn.onclick = _ => {
        var a = numberValue("a"), b = numberValue("b"), n = numberValue("order");
        var gx = numberValue("gx"), gy = numberValue("gy");
        var hx = numberValue("hx"), hy = numberValue("hy");

        Debug.clear();

        var m = PollardRho.solve(gx, gy, hx, hy, a, b, n);
        content.textContent = (m || "Error").toString();
    };
};