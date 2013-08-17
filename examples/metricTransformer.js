#!/usr/bin/env node
"use strict";

/*
    appends a string to the beginning of a metric key
*/


var carbon = require("..");
var stream = require("stream");

// create the listener and writer
var listener = new carbon.UDP(2400); // there's also carbon.TCP
var writer = new carbon.Writer("127.0.0.1", 2401);

// create a standard stream transform instance that operates in object mode
var transformer = stream.Transform({objectMode: true});
transformer._transform = function(rec, encoding, cb) {
    // record is [ "metric.key", value, timestamp ]
    
    rec[0] = "prefix." + rec[0];
    
    this.push(rec);
    
    cb();
};

// send incoming UDP data to the transformer and then on to the actual carbon-
// cache listener
listener.pipe(transformer).pipe(writer);
