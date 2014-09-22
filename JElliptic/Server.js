define(["require", "exports"], function(require, exports) {
    var Server;
    (function (Server) {
        // HACK this is ugly and not performant at all
        // TODO make a real set class
        var PointPair = (function () {
            function PointPair(u, v) {
                this.u = u;
                this.v = v;
            }
            Object.defineProperty(PointPair.prototype, "U", {
                get: function () {
                    return this.u;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PointPair.prototype, "V", {
                get: function () {
                    return this.v;
                },
                enumerable: true,
                configurable: true
            });
            return PointPair;
        })();
        var received = {};

        function send(u, v, p) {
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
        Server.send = send;
    })(Server || (Server = {}));

    
    return Server;
});
//# sourceMappingURL=Server.js.map
