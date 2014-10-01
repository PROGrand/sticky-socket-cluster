# Sticky sessions with proxy


Simple and customizable way to use multicore features with [socket.io](http://socket.io/) and [express](https://github.com/strongloop/express).

## How it works

Launches multiple worker processes through [cluster](http://nodejs.org/docs/latest/api/cluster.html), using bunch of ports. One worker process becomes also 'http-proxy', serving as sticky session balancer. 
