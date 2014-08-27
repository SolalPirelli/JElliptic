// Logs debugging messages
class Debug {
    static clear() {
        document.getElementById("log").innerHTML = "";
    }

    static log(str: string) {
        var elem = document.getElementById("log");

        var span = document.createElement("span");
        span.textContent = str;

        var br = document.createElement("br");

        elem.appendChild(span);
        elem.appendChild(br);
    }
}

// Partition for elements of a group.
enum Partition {
    P0, P1, P2
}

// Element of a group G.
class G {
    // Implementation detail!
    private value: number;

    // Creates a new element from the specified number.
    constructor(value: number) {
        this.value = value;
    }


    // Gets the multiplication-neutral element.
    static One = new G(1);
    // Gets (or sets) the order of the group.
    static Order;


    partition() {
        switch (this.value % 3) {
            case 0:
                return Partition.P0;
            case 1:
                return Partition.P1;
            case 2:
                return Partition.P2;
        }
    }

    mul(other: G): G {
        return new G((this.value * other.value) % (G.Order + 1));
    }

    eq(other: G): boolean {
        return this.value == other.value;
    }

    // Override toString for debugging
    toString(): string {
        return "[G: " + this.value + "]";
    }
}

// Walk over G
class Walk {
    alpha: G;
    beta: G;
    a: number;
    b: number;
    x: G;


    constructor(alpha, beta) {
        this.alpha = alpha;
        this.beta = beta;
        this.a = 0;
        this.b = 0;
        this.x = G.One;
    }


    step(): void {
        switch (this.x.partition()) {
            case Partition.P0:
                this.a = (2 * this.a) % G.Order;
                this.b = (2 * this.b) % G.Order;
                this.x = this.x.mul(this.x);
                return;

            case Partition.P1:
                this.a = (this.a + 1) % G.Order;
                this.x = this.alpha.mul(this.x);
                return;

            case Partition.P2:
                this.b = (this.b + 1) % G.Order;
                this.x = this.beta.mul(this.x);
                return;
        }
    }

    // Override toString for debugging
    toString(): string {
        return "[Walk: a = " + this.a + ", b = " + this.b + ", x = " + this.x + "]";
    }
}

// Simple Pollard's Rho for logarithms implementation
class PollardRho {
    static solve(alpha: G, beta: G): number {
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
    }
}

// Gets the value of the input with the specified name, as a number
function numberValue(elemName: string): number {
    return (<HTMLInputElement> document.getElementById(elemName)).valueAsNumber;
}

window.onload = () => {
    var btn = document.getElementById("button");
    var el = document.getElementById("content");

    btn.onclick = _ => {
        var alpha = numberValue("alpha");
        var beta = numberValue("beta");
        var order = numberValue("order");

        Debug.clear();

        G.Order = order;
        el.textContent = PollardRho.solve(new G(alpha), new G(beta)).toString();
    };
};