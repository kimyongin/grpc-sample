var express = require('express');
var router = express.Router();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var debug = require('debug')('untitled:server');
var http = require('http');

function loadProto(proto, packageName, serviceName) {
    var packageDefinition = protoLoader.loadSync(
        proto, {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true});
    return grpc.loadPackageDefinition(packageDefinition)[packageName][serviceName];
}

router.post('/', function (req, res, next) {
    let Service = loadProto("./proto/" + req.query.proto, req.query.package, req.query.service);
    var client = new Service('localhost:9000', grpc.credentials.createInsecure());
    client[req.query.method](req.body, function (err, response) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(response);
    });
});

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

var port = 3000;
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    debug(error);
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
