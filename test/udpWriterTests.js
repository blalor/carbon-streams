"use strict";

var dgram  = require("dgram");
var expect = require("chai").expect;

var carbon = require("../");

describe("UDP writer", function() {
    var serverSock;
    var writer;
    
    beforeEach(function(done) {
        serverSock = dgram.createSocket("udp4");
        
        serverSock.on("listening", function() {
            var addr = serverSock.address();
            
            writer = new carbon.Writer("127.0.0.1", addr.port);
            
            done();
        });
        
        serverSock.bind(0);
    });
    
    afterEach(function() {
        serverSock.close();
        serverSock = null;
        
        writer = null;
    });
    
    it("sends datagrams", function(done) {
        serverSock.on("message", function(msg) {
            expect(msg.toString()).to.equal("some.metric 42 99");
            
            done();
        });
        
        writer.write(["some.metric", 42, 99]);
    });
});
