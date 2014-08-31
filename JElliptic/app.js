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
            throw (a + " is not invertible");
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
        return new ModNum(-this.val, this.n);
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

        return this.val == other.val;
    };

    ModNum.prototype.value = function () {
        return this.val;
    };

    // override toString for debugging
    ModNum.prototype.toString = function () {
        return this.val + " mod " + this.n;
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
        p.n = n;

        if (!y.pow(2).eq(x.pow(3).add(a.mul(p.x)).add(b))) {
            throw (p + " is not a valid point.");
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

    ModPoint.prototype.mulNum = function (n) {
        var g = this;
        for (var _ = 1; _ < n; _++) {
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
        return "[Point: (" + this.x.value() + ", " + this.y.value() + ") % " + this.n + " (A = " + this.a.value() + ", B = " + this.b.value() + ")]";
    };
    return ModPoint;
})();

// we want to find m such that m*g = h
var Target = (function () {
    function Target(gx, gy, hx, hy, a, b, n) {
        this.g = ModPoint.create(gx, gy, a, b, n);
        this.h = ModPoint.create(hx, hy, a, b, n);
        this.n = n;
    }
    return Target;
})();

// Walk over a curve
var Walk = (function () {
    function Walk(target) {
        this.target = target;
        this.setUV(new ModNum(1, target.n), new ModNum(1, target.n));
    }
    Walk.prototype.step = function () {
        var u, v;
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
    };

    Walk.prototype.eq = function (other) {
        return this.v == other.v && this.u == other.u;
    };

    // Override toString for debugging
    Walk.prototype.toString = function () {
        return "[Walk: u = " + this.u + ", v = " + this.v + ", current = " + this.current + "]";
    };

    Walk.prototype.setUV = function (u, v) {
        this.u = u;
        this.v = v;
        this.current = this.target.g.mulNum(u.value()).add(this.target.h.mulNum(v.value()));
        return this;
    };
    return Walk;
})();

// Simple Pollard's Rho for logarithms implementation
var PollardRho;
(function (PollardRho) {
    // Find m such that m*g = h
    function solve(gx, gy, hx, hy, a, b, n) {
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
    PollardRho.solve = solve;
})(PollardRho || (PollardRho = {}));

// Gets the value of the input with the specified name, as a number
function intValue(elemName) {
    return parseInt(document.getElementById(elemName).value, 10);
}

window.onload = function () {
    var btn = document.getElementById("button");
    var content = document.getElementById("content");

    btn.onclick = function (_) {
        var a = intValue("a"), b = intValue("b"), n = intValue("order");
        var gx = intValue("gx"), gy = intValue("gy");
        var hx = intValue("hx"), hy = intValue("hy");

        console.clear();

        var m = PollardRho.solve(gx, gy, hx, hy, a, b, n);
        content.textContent = (m || "Error").toString();
    };
};
//# sourceMappingURL=app.js.map
