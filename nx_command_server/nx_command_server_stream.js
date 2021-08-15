var express = require('express');
var router = express.Router();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var debug = require('debug')('untitled:server');
var http = require('http');
var Transform = require('stream').Transform;

function loadProto(proto, packageName, serviceName) {
    var packageDefinition = protoLoader.loadSync(
        proto, {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true});
    return grpc.loadPackageDefinition(packageDefinition)[packageName][serviceName];
}

router.post('/proto', function (req, res, next) {
    var proto = new Transform({
        objectMode: true,
        allowHalfOpen: true,
        transform(command, encoding, done) {
            var {protoName, packageName, serviceName, methodName, message} = command;
            let Client = loadProto("./proto/" + protoName, packageName, serviceName);
            var client = new Client('localhost:9000', grpc.credentials.createInsecure());
            client[methodName](message, function (err, response) {
                if (err) {
                    done(err)
                    return;
                }
                done(null, JSON.stringify(response));
            });
        }
    });

    const command = {
        protoName: req.query.proto,
        packageName: req.query.package,
        serviceName: req.query.service,
        methodName: req.query.method,
        message: req.body
    }

    proto.pipe(res);
    proto.write(command)
    proto.end(() => console.log("end"));
});

// `req` is an http.IncomingMessage, which is a readable stream.
// `res` is an http.ServerResponse, which is a writable stream.
router.post('/uppercase', function (req, res, next) {
    // transform is writeable to readable
    var uppercase = new Transform({
        decodeStrings: false
    });
    uppercase._transform = function (chunk, encoding, done) {
        done(null, chunk.toUpperCase());
    };
    req.setEncoding('utf8');
    // req(readable) -> uppercase(writable to readable) -> res(writable)
    // read -> write -> read -> write
    req.pipe(uppercase).pipe(res)
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
