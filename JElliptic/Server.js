define(["require", "exports"], function(require, exports) {
    var Server;
    (function (Server) {
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
