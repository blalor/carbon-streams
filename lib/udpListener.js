"use strict";

var util   = require("util");
var dgram  = require("dgram");
var assert = require("assert-plus");

var CarbonDecoderReadableStream = require("./baseListener");

function UDP(port) {
    assert.number(port, "port");
    
    var self = this;
    
    // == private functions and declarations
    
    var sockets;
    
    function udpCallback(msg /* , rinfo */) {
        // handle messages
        var buf = msg.toString("ascii");
        
        var line;
        var newlineInd;
        
        // operate on all lines
        // @todo why didn't I just do buf.split("\n").forEach(…) ?
        while ((newlineInd = buf.indexOf("\n")) != -1) {
            // there's a newline in the buffer
            
            // find line *without* newline
            line = buf.substring(0, newlineInd);
            
            // strip off line *plus* newline
            buf = buf.substring(newlineInd + 1);
            
            if (line.length) {
                self._dispatchRecord(line);
            }
        }
        
        if (buf.length) {
            self._dispatchRecord(buf);
        }
    }
    
    // == public methods
    
    self.close = function() {
        sockets.forEach(function(sock) {
            sock.close();
        });
        
        self.push(null);
    };
    
    // == and finally, initialization
    
    CarbonDecoderReadableStream.call(self);
    
    sockets = [ dgram.createSocket("udp4"), dgram.createSocket("udp6") ];
    
    sockets.forEach(function(sock) {
        sock.on("listening", function() {
            var addr = sock.address();
            addr.type = "dgram";
            
            self.emit("listening", addr);
        });
        
        sock.on("error", function(err) {
            self.emit("error", err);
        });
        
        sock.on("message", udpCallback);
        
        sock.bind(port);
    });
}

util.inherits(UDP, CarbonDecoderReadableStream);

module.exports = UDP;
