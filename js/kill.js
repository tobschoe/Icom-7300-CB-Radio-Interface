var exec = require('child_process').exec;
var config = require('../config/config.json')

var os = require('os');

module.exports = function (callback){
  exec(config.osKillCmd + config.browser, function(error, stdout, stderr){ callback(stdout); })
}