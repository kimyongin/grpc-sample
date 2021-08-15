const fetch = require('node-fetch');
const queryString = require('query-string');

// greeter
var qs = {proto: "greeter.proto", package: "sample", service: "Greeter", method: "sayHello"}
var body = {name: "kimyongin"}
fetch('http://localhost:3000/proto?' + queryString.stringify(qs), {
    method: "post",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
})
    .then(res => res.json())
    .then(json => console.log(json));

// collector
qs = {proto: "collector.proto", package: "sample", service: "Collector", method: "collect"}
body = {operation: "plus", items: [{id: 1, value: {numValue: 1}}, {id: 2, value: {numValue: 2}}]}
fetch('http://localhost:3000/proto?' + queryString.stringify(qs), {
    method: "post",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
})
    .then(res => res.json())
    .then(json => console.log(json));