var grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");

function loadProto(proto, packageName, serviceName) {
    var packageDefinition = protoLoader.loadSync(
        proto, {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true});
    return grpc.loadPackageDefinition(packageDefinition)[packageName][serviceName];
}

function sayHello(call, callback) {
    callback(null, {message: 'Hello ' + call.request.name});
}

function collect(call, callback) {
    let error = null;
    let result = 0;
    if (call.request.operation === "plus") {
        result = call.request.items.map(item => item.value.numValue).reduce((accumulator, currentValue) => accumulator + currentValue)
    } else {
        error = new Error("not supported operation");
    }
    callback(error, {result})
}

function main() {
    var server = new grpc.Server();
    let Greeter = loadProto("./proto/greeter.proto", "sample", "Greeter");
    let Collector = loadProto("./proto/collector.proto", "sample", "Collector");
    server.addService(Greeter.service, {sayHello: sayHello});
    server.addService(Collector.service, {collect: collect});
    server.bindAsync('0.0.0.0:9000', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();
