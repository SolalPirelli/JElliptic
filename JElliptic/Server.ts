/// <reference path="lib/jquery.d.ts" />

import ModNumber = require("ModNumber");
import ModPoint = require("ModPoint");

module Server {
    export function send(u: ModNumber, v: ModNumber, p: ModPoint): void {
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
}

export = Server;