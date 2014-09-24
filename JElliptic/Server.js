/// <reference path="lib/jquery.d.ts" />
define(["require", "exports"], function(require, exports) {
    var Server;
    (function (Server) {
        function send(u, v, p) {
            var point = {
                U: u.Value.toString(),
                V: v.Value.toString(),
                X: p.X.Value.toString(),
                Y: p.Y.Value.toString()
            };

            $.ajax({
                url: 'http://jelliptic.apphb.com/api/Values',
                type: 'POST',
                data: JSON.stringify(point),
                contentType: 'application/json',
                async: true
            });
        }
        Server.send = send;
    })(Server || (Server = {}));

    
    return Server;
});
//# sourceMappingURL=Server.js.map
