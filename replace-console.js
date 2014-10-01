var cluster = require('cluster');


module.exports = function replaceConsole()
{
	['log','debug','info','warn','error'].forEach(function (item)
		{
			var old = console[item];
			console[item] = function()
			{
				var prefix = '[' + ((cluster && cluster.worker && cluster.worker.id) ? cluster.worker.id : "0") + ']: ';
				old(prefix + Array.prototype.slice.call(arguments));
			}
		});
}
