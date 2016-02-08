"use strict";

var os = require('os');

module.exports = function() {
  return {
    machineStatus: function() {
      var ret = {
        osplatform: os.platform(),
        osrelease: os.release(),
        ostype: os.type(),
        arch: os.arch(),
        endian: os.endianness(),
        freemem: os.freemem(),
        loadave: os.loadavg(),
        uptime: os.uptime(),
        cpus: os.cpus()
      };

      return ret;
    }
  }
};