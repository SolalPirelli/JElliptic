/// <reference path="lib/jquery.d.ts" />
define(["require", "exports"], function(require, exports) {
    var Server;
    (function (Server) {
        function send(u, v, p) {
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
        Server.send = send;
    })(Server || (Server = {}));

    
    return Server;
});
//# sourceMappingURL=Server.js.map
