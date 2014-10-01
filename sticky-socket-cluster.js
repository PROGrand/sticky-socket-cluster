'use strict';

var cluster = require('cluster');

var debug_log = require('debug')('scluster:log');
debug_log.log = console.log.bind(console);
var debug_error = require('debug')('scluster:error');


module.exports = function pool(options, callback)
{
	if (typeof options === 'function')
	{
		callback = options;
		options = {};
	}
	
	var seed = ~~(0.5 /*Math.random()*/ * 1e9);
	
	var session_hash_ip = function (req, res) {

		var ip = (req.connection.remoteAddress || '').split(/\./g);
		
		var hash = ip.reduce(function(r, num) {
			r += parseInt(num, 10);
			r %= 2147483648;
			r += (r << 10)
			r %= 2147483648;
			r ^= r >> 6;
			return r;
			}, seed);
			hash += hash << 3;
			hash %= 2147483648;
			hash ^= hash >> 11;
			hash += hash << 15;
			hash %= 2147483648;
			return hash >>> 0;
		}

	
	options.workers = options.workers || process.env.WORKERS || require('os').cpus().length;
	options.first_port = options.first_port || process.env.FIRST_PORT || 8000;
	options.proxy_port = options.proxy_port || process.env.PROXY_PORT || 5000;
	options.session_hash = options.session_hash || session_hash_ip;
	options.no_sockets = options.no_sockets || false;
	options.start_timeout = options.start_timeout || 3000;
	
	if (cluster.isMaster) {
		
		debug_log('*************** MASTER: ' + require('util').inspect(options, false, null));
		
		var fork_worker = function(port)
		{
			var worker = cluster.fork();
			worker.port = port;
			worker.send({ cmd: 'start', port: worker.port });
		};

		for (var n = 0; n < options.workers; n++) {
			fork_worker(options.first_port + n);
		}

		cluster.on('exit', function(worker, code, signal) {
			debug_error('Worker died (ID: ' + worker.id + ', PID: '
					+ worker.process.pid + '), port: ' + worker.port);
			
			fork_worker(worker.port);
		});
		
		debug_log('init proxy...');
		
		setTimeout(function (){
			require('./proxy').init(options.workers, options.first_port, options.proxy_port, options.session_hash, options.no_sockets)
		}, options.start_timeout);

	} else if (cluster.isWorker) {
		
		process.on('message', function(msg) {
			switch(msg.cmd) {
				case 'start':
					debug_log('*************** WORKER PORT: ' + msg.port);
					callback(msg.port);
					break;
			    }
			});
		
	}
}
