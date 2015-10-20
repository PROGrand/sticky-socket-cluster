"use strict";

var debug_log = require('debug')('scluster:log');
debug_log.log = console.log.bind(console);
var debug_error = require('debug')('scluster:error');


var httpProxy = require('http-proxy');
var http = require('http');

var current_proxy = 0;
var total_workers = 0;

function next_proxy() {
	var proxy = proxies[current_proxy];
	
	require('util').inspect(proxies, false, null);
	
	current_proxy = (current_proxy + 1) % total_workers;
	return proxy;
}


var stickers = {};

var proxies = {};


exports.init = function(workers, first_port, proxy_port, session_hash, no_sockets) {

	total_workers = workers;
	
	for (var n = 0; n < total_workers; n++) {
		proxies[n] = new httpProxy.createProxyServer({
			target : {
				host : '127.0.0.1',
				port : first_port + n
			}
		});

		proxies[n].on('error', function(error, req, res) {

			var json;
			debug_log('proxy error: ' + error);
			if (!res.headersSent) {
				res.writeHead(500, {'content-type': 'application/json'});
			}

			json = { error: 'proxy_error', reason: error.message };
			res.end(JSON.stringify(json))
		});
	}

	var server = http.createServer(function(req, res) {
		get_proxy(session_hash, req, res).web(req, res);
	});

	if (!no_sockets)
	{
		server.on('upgrade', function(req, socket, head) {
			get_proxy(session_hash, req).ws(req, socket, head);
	
		});
	}

	debug_log("main proxy listen on port: " + proxy_port);
	
	server.listen(proxy_port);
}


function get_proxy(session_hash, req, res)
{
	var hash = session_hash(req, res);

	debug_log('hash: ' + hash);
	
	var proxy = undefined;

	if (hash !== undefined) {

		if (stickers[hash] !== undefined) {

			debug_log('restored proxy.');

			proxy = stickers[hash].proxy;
		} else {

			debug_log('assigned proxy.');
			
			proxy = next_proxy();

			stickers[hash] = {
				proxy : proxy,
			}
		}

	} else {

		debug_log('random proxy.');

		proxy = next_proxy();
	}

	return proxy;
}
