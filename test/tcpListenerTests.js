"use strict";

var net    = require("net");
var expect = require("chai").expect;

var carbon = require("../");

describe("TCP listener", function() {
    var listener;
    var addr;
    
    beforeEach(function(done) {
        listener = new carbon.TCP(0);
        
        listener.on("listening", function(_addr) {
            addr = _addr;
            
            done();
        });
    });
    
    afterEach(function() {
        listener.close();
        listener = null;
    });
    
    describe("single connection", function() {
        var clientSock;
        
        function send(str) {
            clientSock.write(new Buffer(str + "\n", "ascii"));
        }
        
        beforeEach(function(done) {
            clientSock = net.connect(addr.port, addr.address, done);
        });

        afterEach(function() {
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
        
        describe("multiple connections", function() {
            var clientSock1, clientSock2;
            
            beforeEach(function(done) {
                clientSock1 = net.connect(addr.port, addr.address, function() {
                    clientSock2 = net.connect(addr.port, addr.address, done);
                });
            });

            afterEach(function() {
                clientSock1.end();
                clientSock1 = null;
                
                clientSock2.end();
                clientSock2 = null;
            });
            
            it("does not interleave data", function(done) {
                var count = 0;
                
                listener.on("data", function(rec) {
                    count += 1;
                    
                    if (count === 1) {
                        expect(rec[0]).to.equal("some.metric");
                        expect(rec[1]).to.equal(99);
                    }
                    
                    if (count === 2) {
                        expect(rec[0]).to.equal("another.metric");
                        expect(rec[1]).to.equal(100);
                        
                        done();
                    }
                });
                
                // this is what happens when you don't use promises
                setImmediate(function() {
                    clientSock1.write("some");
                    
                    setImmediate(function() {
                        clientSock2.write("another");
                        
                        setImmediate(function() {
                            clientSock1.write(".metric");
                            
                            setImmediate(function() {
                                clientSock2.write(".metric");
                                
                                setImmediate(function() {
                                    clientSock1.write(" 99");

                                    setImmediate(function() {
                                        clientSock2.write(" 100");
                                        
                                        setImmediate(function() {
                                            clientSock1.write("\n");
                                            
                                            setImmediate(function() {
                                                clientSock2.write("\n");
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
