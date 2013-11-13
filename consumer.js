var stomp = require('stomp'),
    mysql = require('mysql');


var client = new stomp.Stomp({port: 61613, host: 'localhost', debug: false});
client.connect();

var messages = 0;

client.on('connected', function() {
    console.log('Connected!');
    client.subscribe({destination: '/queue/test', ack: 'client'});
});

client.on('error', function(message) {
    console.log("An error ocurred: " + message.body);
});

client.on('message', function(message) {
    //console.log("HEADERS: " + sys.inspect(message.headers));
    console.log('Message from ActiveMQ: ' + message.body);
    var connection = mysql.createConnection({host: 'localhost', port: 5555, database: 'ipsmq', user: 'ipsmq', password: 'ipsmq'});
    connection.connect();

    connection.on('error', function(err) {
        console.log('DB Error', err);
    });

    var obj = JSON.parse(message.body);
    connection.query('INSERT INTO jobs SET ?', obj, function(err, result) {
        console.log("Latest object ID: " + result.insertId);
        if (err) {
            console.log('Query Error: ' + err);
        }
        else {
            client.ack(message.headers['message-id']);
            messages++;
        }
    });

    connection.end();
});

process.on('SIGINT', function() {
    console.log('\nConsumed ' + messages + ' messages');
    client.disconnect();
});


