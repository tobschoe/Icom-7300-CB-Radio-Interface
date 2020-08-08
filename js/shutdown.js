var exec = require('child_process').exec;
var serialpathconfig = require('../config/serialpathconfig')
var os = require('os');
const { O_DIRECT } = require('constants');

module.exports = function (callback){
  exec(serialpathconfig.shutdownCmd, function(error, stdout, stderr){ callback(stdout); });
}