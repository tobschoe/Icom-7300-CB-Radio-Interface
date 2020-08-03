let port = require("../serial")
const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')
const ByteLength = require('@serialport/parser-byte-length')
var Readline = SerialPort.parsers.Readline // make instance of Readline parser
var config = require('../config/config')
var icomCmd = require("../var")

const parser = port.pipe(new Readline({ encoding: 'hex', delimiter: 'FD' }))

// Class definition
class Tr {
  constructor(cmod, cfrq, cchn, isTx) {
    this.cmod = cmod
    this.cfrq = cfrq
    this.cchn = cchn
    this.isTx = isTx
  }
  
  changeMod(mod) {
    icomCmd.cmod = mod
    port.write(Buffer.from(icomCmd.sendPre + icomCmd.mods[mod] + icomCmd.sendPost, 'hex'))
  }

  changeChn(channel) {
    let chString = icomCmd.chnAr[channel]
    if (chString == undefined) {
      return
    }
    var y = chString.replace('.', '')
    var z = []
    z[1] = y.substr(6, 2)
    z[2] = y.substr(4, 2)
    z[3] = y.substr(2, 2)
    z[4] = y.substr(0, 2)
    let a = z.join('')
    let b = a.replace('.', '0')
    let newChannelString = 'FEFE94E005' + b + '00FD'
    port.write(Buffer.from(newChannelString, 'hex'))
    port.write(Buffer.from('FEFE94E003FD', 'hex'))
  }

  chnMinus(Chn) {
    port.write(Buffer.from('FEFE94E003FD', 'hex'))
    var newchannel = icomCmd.chnAr.indexOf(Chn) - 1
    if (newchannel == 0) {
      return
    }
    var chString = icomCmd.chnAr[newchannel]
    if (chString == undefined) {
      return
    }
    var y = chString.replace('.', '')
    var z = []
    z[1] = y.substr(6, 2)
    z[2] = y.substr(4, 2)
    z[3] = y.substr(2, 2)
    z[4] = y.substr(0, 2)
    var a = ""
    var b = ""
    a = z.join('')
    b = a.replace('.', '0')
    var newChannelString = ""
    newChannelString = 'FEFE94E005' + b + '00FD'
    port.write(Buffer.from(newChannelString, 'hex'))
    port.write(Buffer.from('FEFE94E003FD', 'hex'))
  }

  chnPlus(Chn) {
    port.write(Buffer.from('FEFE94E003FD', 'hex'))
    var newchannel = icomCmd.chnAr.indexOf(Chn) + 1
    if (newchannel == 41) {
      return
    }
    var chString = icomCmd.chnAr[newchannel]
    if (chString == undefined) {
      return
    }
    var y = chString.replace('.', '')
    var z = []
    z[1] = y.substr(6, 2)
    z[2] = y.substr(4, 2)
    z[3] = y.substr(2, 2)
    z[4] = y.substr(0, 2)
    var a = ""
    var b = ""
    a = z.join('')
    b = a.replace('.', '0')
    var newChannelString = ""
    newChannelString = 'FEFE94E005' + b + '00FD'
    port.write(Buffer.from(newChannelString, 'hex'))
    port.write(Buffer.from('FEFE94E003FD', 'hex'))
  }

  ondata() {

  }

  changeFMFilter(filter) {
    port.write(Buffer.from(filter, 'hex'))
  }

  initPortWrite() {
    if(config.autoChnNine == true) {
        port.write(Buffer.from('FEFE94E0000050062700FD', 'hex')) // Set chn 9
        port.write(Buffer.from('FEFE94E0060502FD', 'hex')) // Set Filter 2 FM
        port.write(Buffer.from('FEFE94E0140A' + config.defaultRfPowerfm + 'FD', 'hex')) // setRFpower to defualt fm
        this.cmod = 'FM'
    }
  }


}

module.exports = Tr