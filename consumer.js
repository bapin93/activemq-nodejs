var stomp = require('stomp');

var client = new stomp.Stomp({port: 61613, host: 'localhost', debug: false});
client.connect();

var messages = 0;

client.on('connected', function() {
    client.subscribe({destination: '/queue/test', ack: 'client'});
});

client.on('error', function(message) {
    console.log("Deu merda: " + message.body);
});

client.on('message', function(message) {
    //console.log("HEADERS: " + sys.inspect(message.headers));
    console.log("BODY: " + message.body);
    client.ack(message.headers['message-id']);
    messages++;
});

process.on('SIGINT', function() {
    console.log('\nConsumed ' + messages + ' messages');
    client.disconnect();
});