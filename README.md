# architect-websocket-server
architect websocket server with websocket multiplex suport and routing.

## installing

```sh
npm install architect-websocket-server
```


## Config Format

```js
{
  "packagePath": "architect-websocket-server",
  port: 8080,
  host: '0.0.0.0',
  prefix: '/api',
  channels: ['printer', 'chatroom']
}
```

### Usage

Boot [Architect](https://github.com/c9/architect) :

```js
var path = require('path');
var architect = require("architect");

var configPath = path.join(__dirname, "config.js");
var config = architect.loadConfig(configPath);

architect.createApp(config, function (err, app) {
    if (err) {
        throw err;
    }
    console.log("app ready");
});
```

Configure Architect with `config.js` :

```js
module.exports = [{
    packagePath: "architect-websocket-server",
    port: 8080,
    host: '0.0.0.0',
    channels: ['printer', 'chatroom']
}, './routes'];
```
 
And register your routes in `./routes/index.js` :

```js
module.exports = function setup(options, imports, register) {
    var wsserver = imports.wsserver;
    
    router = wsserver.routers.printer;

    // register routes 
    router.mount('catalogue', function (req, ws) {
        ws.send({message: 'hello, world'});
    });
    
    register();
};
// Consume wsserver plugin
module.exports.consumes=['wsserver'];
```

### Options
* port : tcp port to listent to
* host : host to listen to
* prefix : http path prefix to which SockJS is mounted.
* channels: a list of channels to create.