/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/
"use strict";
// use http library
var http = require('http'),
    sockjs = require('sockjs'),
    Router = require('./lib/Router'),
    multiplex_server = require('websocket-multiplex');

module.exports = function setup(options, imports, register) {

    var log = imports.log.getLogger('wsserver');

    var port = options.port || 1337;
    var host = options.host || '0.0.0.0';
    var server = http.createServer();
    var api = sockjs.createServer({
        log: function (severity, message) {
            var level = log[severity];
            if (level && typeof level == 'function') {
                level.bind(log)(message);
            }
        }
    });

    api.installHandlers(server, {
        prefix: options.prefix || '/api'
    });
    var multiplexer;
    if (options.channels) { // multiplexing is enabled
        multiplexer = new multiplex_server.MultiplexServer(api);
    }

    // Load channels on multiplexer
    var channels = (options.channels || []).reduce(function (prev, curr) {
        log.debug('creating channel for', curr);
        prev[curr] = multiplexer.registerChannel(curr);
        return prev;
    }, {});

    register(null, {
        wsserver: {
            server : api,
            channels: channels,
            routers : (options.channels || []).reduce(function (prev, curr) {
                prev[curr] = new Router(channels[curr], log);
                return prev;
            }, {})
        },
        onDestroy: function (callback) {
            log.info('closing serveur');
            server.close(callback);
        }
    });

    // Start listening port
    server.listen(port, host, function (err) {

        if (err) {
            return register(err);
        }

        log.info('listening on %s:%s', host, port);
    });
};

module.exports.consumes = ["log"];
module.exports.provides = ["wsserver"];
