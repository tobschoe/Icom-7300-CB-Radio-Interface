const serialpathconfig = require('../config/serialpathconfig')
const SerialPort = require('serialport')
let config = require('../config/config.json')

const port = new SerialPort(serialpathconfig.serialpath,
{
  baudRate: config.baudrate,
  dataBits: 8,
  stopBits: 1,
  Parity: 'none',
  flowControl: false
  },
  function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
  },
  
)

module.exports = port