/// <reference path="lib/jquery.d.ts" />

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import IResultSink = require("IResultSink");

module ResultSinks {
    export function server(): IResultSink {
        return {
            send(u: ModNumber, v: ModNumber, p: ModPoint): void {
                var point = {
                    U: u.value.toString(),
                    V: v.value.toString(),
                    X: p.x.value.toString(),
                    Y: p.y.value.toString()
                };

                $.ajax({
                    url: 'http://jelliptic.apphb.com/api/Values',
                    type: 'POST',
                    data: JSON.stringify(point),
                    contentType: 'application/json',
                    async: true // don't wait for a server reply
                });
            }
        };
    }

    export function debug(): IResultSink {
        return {
            send(u: ModNumber, v: ModNumber, p: ModPoint): void {
                console.log("u = " + u + ", v = " + v + ", p = " + p);
            }
        };
    }

    export function combine(...sinks: IResultSink[]) {
        return {
            send(u: ModNumber, v: ModNumber, p: ModPoint): void {
                sinks.forEach(s => s.send(u, v, p));
            }
        }
    }
}

export = ResultSinks;