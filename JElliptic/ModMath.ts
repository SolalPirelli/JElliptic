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

export = ModMath;