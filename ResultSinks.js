/// <reference path="lib/jquery.d.ts" />
define(["require", "exports"], function(require, exports) {
    var ResultSinks;
    (function (ResultSinks) {
        function server() {
            return {
                send: function (u, v, p) {
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
                        async: true
                    });
                }
            };
        }
        ResultSinks.server = server;

        function debug() {
            return {
                send: function (u, v, p) {
                    console.log("u = " + u + ", v = " + v + ", p = " + p);
                }
            };
        }
        ResultSinks.debug = debug;

        function combine() {
            var sinks = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                sinks[_i] = arguments[_i + 0];
            }
            return {
                send: function (u, v, p) {
                    sinks.forEach(function (s) {
                        return s.send(u, v, p);
                    });
                }
            };
        }
        ResultSinks.combine = combine;
    })(ResultSinks || (ResultSinks = {}));

    
    return ResultSinks;
});
//# sourceMappingURL=ResultSinks.js.map
