const SerialPort = require('serialport')
const config = require('../config/config')

const port = new SerialPort(config.serialpath,
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