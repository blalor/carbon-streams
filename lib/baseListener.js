"use strict";

var stream = require("stream");
var util   = require("util");

function CarbonDecoderReadableStream() {
    // == private functions and declarations
    
    var self = this;

    // == overridden methods

    // noop; we're going to push data regardless
    self._read = function(/* size */) {};
    
    // == private methods

    self._dispatchRecord = function(rec) {
        var splitRec = rec.split(" ");
        
        var metricName = splitRec[0];
        var metricValue = parseFloat(splitRec[1]);
        var metricTimestamp;
        
        // provide our own timestamp if none is specified
        if (splitRec.length === 3) {
            metricTimestamp = parseInt(splitRec[2], 10);
        } else {
            metricTimestamp = Math.floor((new Date()).getTime() / 1000);
        }
        
        self.push([metricName, metricValue, metricTimestamp]);
    };

    // == and finally, initialization

    stream.Readable.call(self, {
        objectMode: true
    });
}

util.inherits(CarbonDecoderReadableStream, stream.Readable);

module.exports = CarbonDecoderReadableStream;
