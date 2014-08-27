// Logs debugging messages
var Debug = (function () {
    function Debug() {
    }
    Debug.clear = function () {
        document.getElementById("log").innerHTML = "";
    };

    Debug.log = function (str) {
        var elem = document.getElementById("log");

        var span = document.createElement("span");
        span.textContent = str;

        var br = document.createElement("br");

        elem.appendChild(span);
        elem.appendChild(br);
    };
    return Debug;
})();

// Partition for elements of a group.
var Partition;
(function (Partition) {
    Partition[Partition["P0"] = 0] = "P0";
    Partition[Partition["P1"] = 1] = "P1";
    Partition[Partition["P2"] = 2] = "P2";
})(Partition || (Partition = {}));

// Element of a group G.
var G = (function () {
    // Creates a new element from the specified number.
    function G(value) {
        this.value = value;
    }
    G.prototype.partition = function () {
        switch (this.value % 3) {
            case 0:
                return 0 /* P0 */;
            case 1:
                return 1 /* P1 */;
            case 2:
                return 2 /* P2 */;
        }
    };

    G.prototype.mul = function (other) {
        return new G((this.value * other.value) % (G.Order + 1));
    };

    G.prototype.eq = function (other) {
        return this.value == other.value;
    };

    // Override toString for debugging
    G.prototype.toString = function () {
        return "[G: " + this.value + "]";
    };
    G.One = new G(1);
    return G;
})();

// Walk over G
var Walk = (function () {
    function Walk(alpha, beta) {
        this.alpha = alpha;
        this.beta = beta;
        this.a = 0;
        this.b = 0;
        this.x = G.One;
    }
    Walk.prototype.step = function () {
        switch (this.x.partition()) {
            case 0 /* P0 */:
                this.a = (2 * this.a) % G.Order;
                this.b = (2 * this.b) % G.Order;
                this.x = this.x.mul(this.x);
                return;

            case 1 /* P1 */:
                this.a = (this.a + 1) % G.Order;
                this.x = this.alpha.mul(this.x);
                return;

            case 2 /* P2 */:
                this.b = (this.b + 1) % G.Order;
                this.x = this.beta.mul(this.x);
                return;
        }
    };

    // Override toString for debugging
    Walk.prototype.toString = function () {
        return "[Walk: a = " + this.a + ", b = " + this.b + ", x = " + this.x + "]";
    };
    return Walk;
})();

// Simple Pollard's Rho for logarithms implementation
var PollardRho = (function () {
    function PollardRho() {
    }
    PollardRho.solve = function (alpha, beta) {
        var tortoise = new Walk(alpha, beta);
        var hare = new Walk(alpha, beta);

        for (var step = 1; step < G.Order; step++) {
            tortoise.step();

            hare.step();
            hare.step();

            Debug.log("Step: " + step);
            Debug.log("Tortoise: " + tortoise);
            Debug.log("Hare: " + hare);
            Debug.log("---");

            if (tortoise.x.eq(hare.x)) {
                var r = tortoise.b - hare.b;

                if (r == 0) {
                    return null;
                }

                return (1.0 / r * (hare.a - tortoise.a)) % G.Order;
            }
        }
    };
    return PollardRho;
})();

// Gets the value of the input with the specified name, as a number
function numberValue(elemName) {
    return document.getElementById(elemName).valueAsNumber;
}

window.onload = function () {
    var btn = document.getElementById("button");
    var el = document.getElementById("content");

    btn.onclick = function (_) {
        var alpha = numberValue("alpha");
        var beta = numberValue("beta");
        var order = numberValue("order");

        Debug.clear();

        G.Order = order;
        el.textContent = PollardRho.solve(new G(alpha), new G(beta)).toString();
    };
};
//# sourceMappingURL=app.js.map
