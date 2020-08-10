var exec = require('child_process').exec;
var config = require('../config/config.json')

var os = require('os');
const { O_DIRECT } = require('constants');

module.exports = function (cmd, callback){
  exec(cmd, function(error, stdout, stderr){ callback(stdout); })
}