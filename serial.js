const SerialPort = require('serialport')
const config = require('./config/config')

const port = new SerialPort(config.serialpath, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
},

{
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  Parity: 'none',
  flowControl: false
}
)

module.exports = port