var exec = require('child_process').exec;
var config = require('../config/config')

module.exports = function (callback){
  exec(config.shutdownCmd, function(error, stdout, stderr){ callback(stdout); });
}