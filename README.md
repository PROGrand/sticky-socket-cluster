# Sticky sessions with proxy

Simple and customizable way to use multicore features with [socket.io](http://socket.io/) and [express](https://github.com/strongloop/express).

## How it works

Launches multiple worker processes through [cluster](http://nodejs.org/docs/latest/api/cluster.html), using bunch of ports.
One worker process becomes also 'http-proxy', serving as sticky session balancer.

Establishes sticky round-robin balancer for any kind of http frameworks. Not only, but including socket.io and express. 
Client will always connect to same worker process sticked with customizable hash function.
For example, socket.io multi-stage authorization will work as expected. 

## Installation

```bash
npm install sticky-socket-cluster
```


## Basic Usage

```javascript
require('sticky-socket-cluster')(start);

function start(port) {
	require('http').createServer(function(req, res) {
	  		res.end('worker: ' + port);
		}).listen(port, function() {
	  	console.log('server started on ' + port + ' port');
	});
}
```

## Customized Usage

```javascript
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
	var express = require('express');
	var http = require('http');
	var app = express();
	var server = http.Server(app);
	var io = require('socket.io')(server);
	
	io.on('connection', function(socket)
	{
		console.log("socket.io connection handler...");
		//...
	});

	server.listen(port, function() {
		console.log('Express and socket.io listening on port ' + port);
	});
}
```


#### LICENSE

This software is licensed under the MIT License.

Copyright Vladimir E. Koltunov and contributors, 2014-2015.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
