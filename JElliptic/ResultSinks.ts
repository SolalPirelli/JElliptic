"use strict";

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");
import IResultSink = require("IResultSink");

module ResultSinks {
    export function server(): IResultSink {
        return {
            send(u: ModNumber, v: ModNumber, p: ModPoint): void {
                var req = new XMLHttpRequest();
                req.open("POST", "http://jelliptic.apphb.com/api/Values", true);
                req.setRequestHeader('Content-type', 'application/json');
                req.send(JSON.stringify({
                    U: u.value.toString(),
                    V: v.value.toString(),
                    X: p.x.value.toString(),
                    Y: p.y.value.toString()
                }));
            }
        };
    }

    export function debug(): IResultSink {
        return {
            send(u: ModNumber, v: ModNumber, p: ModPoint): void {
                //console.log("u = " + u + ", v = " + v + ", p = " + p);
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