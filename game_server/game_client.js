var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

function loadProto(proto, packageName, serviceName) {
    var packageDefinition = protoLoader.loadSync(
        proto, {keepCase: true, longs: String, enums: String, defaults: true, oneofs: true});
    return grpc.loadPackageDefinition(packageDefinition)[packageName][serviceName];
}

// greeter
let Greeter = loadProto("./proto/greeter.proto", "sample", "Greeter");
var greeterClient = new Greeter('localhost:9000', grpc.credentials.createInsecure());
var helloRequest = {name: "kimyongin"}
greeterClient.sayHello(helloRequest, function (err, response) {
    if (err) {
        console.error(err);
        return
    }
    console.log('Greeting:', response.message);
});

// collector
let Collector = loadProto("./proto/collector.proto", "sample", "Collector");
var collectorClient = new Collector('localhost:9000', grpc.credentials.createInsecure());
var collectRequest = {
    operation: "plus",
    items: [{id: 1, value: {numValue: 1}}, {id: 2, value: {numValue: 2}}]
}
collectorClient.collect(collectRequest, function (err, response) {
    if (err) {
        console.error(err);
        return
    }
    console.log('result:', response.result);
});
