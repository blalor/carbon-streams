Simple stream objects for working with Carbon (Graphite) streams.

# overview

I need to implement a simple metric key mangler for my Graphite infrastructure.  [collectd][collectd] is great for capturing metrics, but the paths are a bit verbose.  For example, I think the following make a little more sense:

    collectd.my-host.cpu.0.cpu.idle.value → collectd.my-host.cpu.0.idle
    
    collectd.my-host.df.df.boot.free → collectd.my-host.df.boot.free
    
    collectd.my-host.interface.if_errors.eth0.rx → collectd.my-host.interface.eth0.rx.errors
    collectd.my-host.interface.if_octets.eth0.rx → collectd.my-host.interface.eth0.rx.octets
    collectd.my-host.interface.if_packets.eth0.rx → collectd.my-host.interface.eth0.rx.packets

You might also want to derive a hierarchy from a well-structured hostname.  Instead of `usw2a-dev-webserver-01` you could do `dev.usw2a.webserver-01`.  Or you could drop a metric entirely.

Some of this can be implemented with Carbon's own `rewrite-rules.conf`, but those are fairly limited to prefix/suffix mangling.  I'm also gnawing on the idea of building a simple pub/sub mechanism with [ZeroMQ][zmq] so that subscribers can receive metric values in real-time, as well as notifications of metric lifecycle events (a new host comes online, or stops updating).

# examples

There's only one example right now, bit it shows how you can create a simple metric rewriter by implementing a `stream.Transform` instance.

[collectd]: http://collectd.org/
[zmq]: http://zeromq.org/
