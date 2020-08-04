var os = require('os');

let config = {}


//  Com port/serial port path
config.serialpath = ""  // Enter the serialport path to your Ic-7300 or leave string empty to use default config
if (config.serialpath === "") {
  if (os.platform() === 'win32' || 'win64') {
    config.serialpath = 'COM3'
  }
  if (os.platform() === 'linux'){
    config.serialpath = "/dev/ttyUSB0" 
  }
}

//  Default RF Power in Percent
//  0000 = 0% / 0255 = 100%
config.defaultRfPoweram = '0040'
config.defaultRfPowerfm = '0026'
config.defaultRfPowerssb = '0051'

//  FM-TX-RX-Filter-Switcher :
//  Changes your Fm filter while sending and recieving. (Smaller filter while RX, wider filter while Tx)
config.fmTxRxFilterSwitcher = true //  true or talse

config.defaultFMTxFilter = "FEFE94E0060501FD"
config.defaultFMRxFilter = "FEFE94E0060502FD"

//  Turn on/off the function to auto go on Chn 9 FM
config.autoChnNine = true //  true or false

//  Baudrate (on windows only 9600)
config.baudrate = 9600

module.exports = config
