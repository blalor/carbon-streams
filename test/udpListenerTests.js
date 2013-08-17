"use strict";

var dgram  = require("dgram");
var expect = require("chai").expect;

var carbon = require("../");

describe("UDP listener", function() {
    var listener;
    var clientSock;
    var listenerAddr;
    
    function send(str) {
        var buf = new Buffer(str, "ascii");

        clientSock.send(buf, 0, buf.length, listenerAddr.port, listenerAddr.address);
    }
    
    beforeEach(function(done) {
        clientSock = dgram.createSocket("udp4");
        
        listener = new carbon.UDP(0);
        
        listener.on("listening", function(addr) {
            if (addr.family === "IPv4") {
                listenerAddr = addr;
                
                done();
            }
        });
    });
    
    afterEach(function() {
        listener.close();
        listener = null;
        
        clientSock = null;
    });
    
    it("converts a line to a record", function(done) {
        listener.on("data", function(rec) {
            expect(rec).to.have.length(3);
            expect(rec[0]).to.equal("some.metric");
            expect(rec[1]).to.equal(42);
            expect(rec[2]).to.equal(99);
            
            done();
        });
        
        send("some.metric 42 99");
    });
    
    it("appends a missing timestamp", function(done) {
        listener.on("data", function(rec) {
            expect(rec, "length").to.have.length(3);
            expect(rec[0], "metric name").to.equal("some.metric");
            expect(rec[1], "metric value").to.equal(42);
            expect(rec[2], "timestamp").to.be.closeTo((new Date()).getTime() / 1000, 1);
            
            done();
        });
        
        send("some.metric 42");
    });
});
