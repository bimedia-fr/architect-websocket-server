/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/
'use strict';

function Router(channel, log) {

    this.handlers = {};
    this.clients = [];
    this.connectHandler = null;
    var self = this;

    channel.on('connection', function (ws) {
        self.clients.push(ws);
        function onData(data) {
            var r = JSON.parse(data) || [];
            var request = {
                route: r[0],
                data: r[1]
            };
            if (self.handlers[request.route]) {
                self.handlers[request.route](request, ws);
            } else {
                log.warn(request.route, 'not found in', Object.keys(self.handlers));
            }
        }

        // Send data to clients
        ws.send = function (event, data) {
            ws.write(JSON.stringify([event, data]));
        };

        // Broadcast data to all connected clients
        ws.broadcast = function (data) {
            self.clients.forEach(function (pos) {
                ws.send(data, pos);
            });
        };
        ws.on('data', onData);
        ws.once('close', function () {
            var index = self.clients.indexOf(ws);
            self.clients.splice(index, 1);
            ws.removeListener('data', onData);
        });

        if (self.connectHandler) {
            self.connectHandler(ws);
        }
    });
}

Router.prototype.onConnect = function (handler) {
    this.connectHandler = handler;
};

Router.prototype.mount = function (path, handler) {
    this.handlers[path] = handler;
    return this;
};

Router.prototype.unmount = function (path) {
    delete this.handlers[path];
    return this;
};

module.exports = Router;
