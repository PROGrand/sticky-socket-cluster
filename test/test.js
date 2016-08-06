require('sticky-socket-cluster/replace-console')();
    // prefixes console output with worker ids.

var options = {
    workers: 2, // total workers (default: cpu cores count).
    first_port: 8000, // 8000, 8001 are worker's ports (default: 8000).
    proxy_port: 5000, // default (5000).
    session_hash: function (req, res) { return req.connection.remoteAddress; },
        // can use cookie-based session ids and etc. (default: int31 hash).

    no_sockets: false // allow socket.io proxy (default: false).
};

require('sticky-socket-cluster')(options, start);

function start(port) {
	const path = require('path');
	const cookieParser = require('cookie-parser');
	const bodyParser = require('body-parser');
	var express = require('express');
	var http = require('http');
	var app = express();
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));

	var server = http.Server(app);
	var io = require('socket.io')(server);

	io.on('connection', function(socket)
	{
		console.log("socket.io connection handler...");
		
		socket.on('fromclient', function(msg)
		{
			console.log("message from client received: " + msg.text);
			socket.emit('message2', { text: 'stage 3'});
		});
		
		socket.emit('message', { text: 'stage 1'});
	});

	server.listen(port, function() {
		console.log('Express and socket.io listening on port ' + port);
	});
}
