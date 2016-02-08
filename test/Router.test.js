/*jslint node : true, nomen: true, plusplus: true, vars: true, eqeq: true,*/
'use strict';
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Router = require('../lib/Router');

var router, ws = new EventEmitter();
module.exports = {
    setUp: function (done) {
        var channel = new EventEmitter();
        router = new Router(channel);
        channel.emit('connection', ws);
        done();
    },
    testMount: function (test) {
        router.mount('route', function (request, ws) {
            test.ok(request);
            test.equal(request.route, 'route');
            test.ok(request.data);
            test.equal(request.data.key, 'value');
            test.done();
        });
        ws.emit('data', '["route", {"key": "value"}]');
    }
};
