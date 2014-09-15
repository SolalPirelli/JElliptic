import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

module Server {
    // HACK this is ugly and not performant at all
    // TODO make a real set class
    class PointPair {
        private u: number;
        private v: number;

        constructor(u: number, v: number) {
            this.u = u;
            this.v = v;
        }

        get U(): number {
            return this.u;
        }

        get V(): number {
            return this.v;
        }
    }
    var received: { [point: string]: PointPair } = {};

    export function send(u: ModNumber, v: ModNumber, p: ModPoint): void {
        console.log("Server: got u = " + u + ", v = " + v + ", p = " + p);

        /*            if (tortoise.Current.eq(hare.Current) && !tortoise.V.eq(hare.V)) {
                var log = tortoise.U.sub(hare.U).div(hare.V.sub(tortoise.V));

                var actualTarget = generator.mulNum(log.Value);
                if (!target.eq(actualTarget)) {
                    throw "Incorrect result found. (" + log + ")";
                }

                return log.Value;
            }*/
    }
}

export = Server;