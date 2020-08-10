var os = require('os');
var cfg = require("../classes/configc") // object cfg
let serialpathconfig = {}

//  Com port/serial port path
serialpathconfig.serialpath = ""  // Enter the serialport path to your Ic-7300 or leave string empty to use default config
serialpathconfig.shutdownCmd = ""

if (serialpathconfig.serialpath === "") {
  if (os.platform() === 'win32' || 'win64') {
    serialpathconfig.serialpath = 'COM3'
    cfg.write("shutdownCmd" ,"shutdown")
  }
  if (os.platform() === 'linux'){
    serialpathconfig.serialpath = '/dev/ttyUSB0' 
    cfg.write("shutdownCmd" ,"sudo shutdown now")
  }
}

module.exports = serialpathconfig