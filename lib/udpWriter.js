"use strict";

var stream = require("stream");
var util   = require("util");
var dgram  = require("dgram");
var assert = require("assert-plus");

function Writer(host, port, useIPv6) {
    assert.string(host, "host");
    assert.number(port, "port");
    assert.optionalBool(useIPv6, "useIPv6");

    // == private functions and declarations
    
    var self = this;
    var sock;
    
    // == overridden methods
    
    self._write = function(chunk, encoding, cb) {
        var buf = new Buffer(chunk.join(" "), "ascii");

        sock.send(buf, 0, buf.length, port, host, function(err /* , bytes */) {
            cb(err);
        });
    };
    
    // == and finally, initialization
    
    stream.Writable.call(self, {
        objectMode: true
    });
    
    sock = dgram.createSocket(useIPv6 ? "udp6" : "udp4");
}

util.inherits(Writer, stream.Writable);

module.exports = Writer;
