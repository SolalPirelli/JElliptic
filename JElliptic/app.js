// Logs debugging messages
var Debug;
(function (Debug) {
    function clear() {
        document.getElementById("log").innerHTML = "";
    }
    Debug.clear = clear;

    function log(str) {
        var elem = document.getElementById("log");

        var span = document.createElement("span");
        span.textContent = str;

        var br = document.createElement("br");

        elem.appendChild(span);
        elem.appendChild(br);
    }
    Debug.log = log;
})(Debug || (Debug = {}));

var ModMath;
(function (ModMath) {
    // Non-negative mod
    function mod(a, n) {
        return ((a % n) + n) % n;
    }
    ModMath.mod = mod;

    // from http://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Modular_integers
    function modInverse(a, n) {
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
    ModMath.modInverse = modInverse;
})(ModMath || (ModMath = {}));

var ModNum = (function () {
    function ModNum(val, n) {
        this.val = ModMath.mod(val, n);
        this.n = n;
    }
    ModNum.prototype.negate = function () {
        return new ModNum(-this.value, this.n);
    };

    ModNum.prototype.add = function (other) {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val + other.val, this.n);
    };

    ModNum.prototype.addNum = function (n) {
        return new ModNum(this.val + n, this.n);
    };

    ModNum.prototype.sub = function (other) {
        return this.add(other.negate());
    };

    ModNum.prototype.mul = function (other) {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val * other.val, this.n);
    };

    ModNum.prototype.mulNum = function (n) {
        return new ModNum(n * this.val, this.n);
    };

    ModNum.prototype.div = function (other) {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return new ModNum(this.val * ModMath.modInverse(other.val, this.n), this.n);
    };

    ModNum.prototype.pow = function (n) {
        var result = this;
        for (var _ = 1; _ < n; _++) {
            result = result.mul(this);
        }
        return result;
    };

    ModNum.prototype.eq = function (other) {
        if (this.n != other.n) {
            throw "Incompatible ModNums";
        }

        return this.value == other.value;
    };

    ModNum.prototype.value = function () {
        return this.val;
    };

    // override toString for debugging
    ModNum.prototype.toString = function () {
        return "[" + this.value + " mod " + this.n + "]";
    };
    return ModNum;
})();

// Point in an elliptic curve
var ModPoint = (function () {
    function ModPoint() {
    }
    // Creates a new element from the specified number.
    ModPoint.create = function (x, y, a, b, n) {
        return ModPoint.createNum(new ModNum(x, n), new ModNum(y, n), new ModNum(a, n), new ModNum(b, n), n);
    };

    ModPoint.createNum = function (x, y, a, b, n) {
        var p = new ModPoint();
        p.x = x;
        p.y = y;
        p.a = a;
        p.b = b;

        if (!y.pow(2).eq(x.pow(3).add(a.mul(p.x)).add(b))) {
            Debug.log("!!! ERROR: " + p + " is not a valid point !!!");
        }

        return p;
    };

    // Adds this element with another
    ModPoint.prototype.add = function (other) {
        var lambda;
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
    };

    ModPoint.prototype.mulNum = function (c) {
        var g = this;
        for (var n = 1; n < c; n++) {
            g = g.add(this);
        }

        return g;
    };

    ModPoint.prototype.partition = function (count) {
        return this.x.value() % count;
    };

    ModPoint.prototype.eq = function (other) {
        return this.x.eq(other.x) && this.y.eq(other.y);
    };

    // Override toString for debugging
    ModPoint.prototype.toString = function () {
        return "[" + this.x.value() + ", " + this.y.value() + "] % " + this.n + "(A = " + this.a.value() + ", B = " + this.b.value() + ")";
    };
    return ModPoint;
})();

// Walk over G
var Walk = (function () {
    function Walk() {
    }
    Walk.create = function (gx, gy, hx, hy, a, b, n) {
        var w = new Walk();
        w.g = ModPoint.create(gx, gy, a, b, n);
        w.h = ModPoint.create(hx, hy, a, b, n);
        w.u = new ModNum(1, n);
        w.v = new ModNum(0, n);
        w.p = w.g;
        return w;
    };

    Walk.createNum = function (g, h, u, v) {
        var w = new Walk();
        w.g = g;
        w.h = h;
        w.u = u;
        w.v = v;
        w.p = g.mulNum(u.value()).add(h.mulNum(v.value()));
        return w;
    };

    Walk.prototype.step = function () {
        var u, v;
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
    };

    Walk.prototype.eq = function (other) {
        return this.v == other.v && this.u == other.u;
    };

    // Override toString for debugging
    Walk.prototype.toString = function () {
        return "[Walk: u = " + this.u + ", v = " + this.v + ", p = " + this.p + "]";
    };
    return Walk;
})();

// Simple Pollard's Rho for logarithms implementation
var PollardRho;
(function (PollardRho) {
    // Find m such that m*g = h
    function solve(gx, gy, hx, hy, a, b, n) {
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
    PollardRho.solve = solve;
})(PollardRho || (PollardRho = {}));

// Gets the value of the input with the specified name, as a number
function numberValue(elemName) {
    return document.getElementById(elemName).valueAsNumber;
}

window.onload = function () {
    var btn = document.getElementById("button");
    var content = document.getElementById("content");

    btn.onclick = function (_) {
        var a = numberValue("a"), b = numberValue("b"), n = numberValue("order");
        var gx = numberValue("gx"), gy = numberValue("gy");
        var hx = numberValue("hx"), hy = numberValue("hy");

        Debug.clear();

        var m = PollardRho.solve(gx, gy, hx, hy, a, b, n);
        content.textContent = (m || "Error").toString();
    };
};
//# sourceMappingURL=app.js.map
