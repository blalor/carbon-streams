"use strict";

var util   = require("util");
var net    = require("net");
var assert = require("assert-plus");

var CarbonDecoderReadableStream = require("./baseListener");

function TCP(port) {
    assert.number(port, "port");

    // == private functions and declarations
    
    var self = this;
    var buf = "";
    var tcpServer;
    
    function dataHandler(data) {
        var line;
        var newlineInd;
        
        buf += data;
        
        // operate on all lines
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
    }
    
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
        
        clientSock.on("data", dataHandler);
    });
    
    tcpServer.on("error", function(err) {
        self.emit("error", err);
    });
    
    tcpServer.listen(port);
}

util.inherits(TCP, CarbonDecoderReadableStream);

module.exports = TCP;
