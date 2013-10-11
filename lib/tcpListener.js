"use strict";

var util   = require("util");
var net    = require("net");
var assert = require("assert-plus");
var split  = require("split");

var CarbonDecoderReadableStream = require("./baseListener");

function TCP(port) {
    assert.number(port, "port");

    // == private functions and declarations
    
    var self = this;
    var tcpServer;
    
    // == public methods
    
    self.close = function() {
        tcpServer.close();
        
        self.push(null);
    };
    
    // == and finally, initialization

    CarbonDecoderReadableStream.call(self, {
        objectMode: true
    });
    
    tcpServer = net.createServer();

    tcpServer.on("listening", function() {
        var addr = tcpServer.address();
        addr.type = "stream";
        
        self.emit("listening", addr);
    });
    
    tcpServer.on("connection", function(clientSock) {
        // handle connections
        clientSock.setEncoding("ascii"); // probably
        
        clientSock
            .pipe(split(), { end: false })
            .on("data", self._dispatchRecord);
    });
    
    tcpServer.on("error", function(err) {
        self.emit("error", err);
    });
    
    tcpServer.listen(port);
}

util.inherits(TCP, CarbonDecoderReadableStream);

module.exports = TCP;
