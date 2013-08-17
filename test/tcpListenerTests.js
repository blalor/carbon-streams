"use strict";

var net    = require("net");
var expect = require("chai").expect;

var carbon = require("../");

describe("TCP listener", function() {
    var listener;
    var clientSock;
    
    function send(str) {
        clientSock.write(new Buffer(str + "\n", "ascii"));
    }
    
    beforeEach(function(done) {
        listener = new carbon.TCP(0);
        
        listener.on("listening", function(addr) {
            clientSock = net.connect(addr.port, addr.address, done);
        });
    });
    
    afterEach(function() {
        listener.close();
        listener = null;
        
        clientSock.end();
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
