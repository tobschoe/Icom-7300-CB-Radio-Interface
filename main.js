let serialpathconfig = require('./config/serialpathconfig')
const SerialPort = require('serialport')
const port = require('./js/serial')
var Readline = SerialPort.parsers.Readline // make instance of Readline parser
var config = require('./config/config.json')
var icomCmd = require("./js/var")
var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)
var express = require('express')
let shutdown = require('./js/shutdown.js')
let Tr = require("./classes/tr")
let Configc = require("./classes/configc")
let icom = new Tr
var cfg = require("./classes/configc")  // object cfg
function init() {

}

function checkIfMod (LatestData) {
  switch (LatestData.slice(0, -2)) {
    case "fefe" + config.addrContr.toLocaleLowerCase() + config.addrIcom + "0401":
    case 'fefe00940101':
      io.emit('cMod', 'USB')
      icom.cmod = "USB"
      // change rf power FEFE94E0140A0026FD = Default FM FEFE94E0140A0051FD ) Default SSB
      port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPowerssb + icomCmd.sendPost, 'hex'))
      break
    case "fefe" + config.addrContr.toLocaleLowerCase() + config.addrIcom + "0400":
    case 'fefee00940100':
      io.emit('cMod', 'LSB')
      icom.cmod = 'LSB'
      port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPowerssb + icomCmd.sendPost, 'hex'))
      break
    case "fefe" + config.addrContr.toLocaleLowerCase() + config.addrIcom + "0402":
    case 'fefe00940102':
      io.emit('cMod', 'AM')
      icom.cmod = 'AM'
      port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPoweram + icomCmd.sendPost, 'hex'))
      break
    case "fefe" + config.addrContr.toLocaleLowerCase() + config.addrIcom + "0405":
    case 'fefe00940105':
      io.emit('cMod', 'FM')
      icom.cmod = 'FM'
      port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPowerfm + icomCmd.sendPost, 'hex'))
      break
  }
}

function checkIfFrq (LatestData) {
  if (LatestData.length == 20) {
    if (LatestData != undefined && LatestData != null) {
      var res = LatestData.split('')
      formFrq = res[res.length - 4] + res[res.length - 3] + '.' + res[res.length - 6] + res[res.length - 5] + res[res.length - 8] + '.' + res[res.length - 7] + res[res.length - 10]
      io.emit('frq', formFrq)
    }
  }
}

function checkIfNoise (LatestData) {
  if (LatestData.length == 16) {
    io.emit('noise', LatestData.slice(-3))
    icom.cnoise = LatestData.slice(-3)
    // LatestData.slice(-3)
    noiselevelInt = parseInt(LatestData.slice(-3))
    if (icom.cmod == 'FM') { // Check if Mod is FM
      if (noiselevelInt <= 1 && !icom.isTx) {
        if (config.fmTxRxFilterSwitcher == true) {
          icom.changeFMFilter(config.defaultFMTxFilter)
        }
        icom.isTx = true
      }
      if (noiselevelInt > 1 && icom.isTx) {
        if (config.fmTxRxFilterSwitcher == true) {
          icom.changeFMFilter(config.defaultFMRxFilter)
        }
        icom.isTx = false
      }
    }
  }
}

function askTrForDataInt() {
  modInt = setInterval(function () {
    port.write(Buffer.from(icomCmd.askMod, 'hex')) // On connect check current modulation
    clearInterval(modInt)
  }, 1200)
  
  frqInt = setInterval(function () {
    port.write(Buffer.from(icomCmd.askFrq, 'hex')) // On connect check current frequency
    clearInterval(frqInt)
  }, 1000)
  
  // Write cmd to port every 300ms to ask the current noise level (0-255)
  noiseInt = setInterval(function () {
      port.write(Buffer.from(icomCmd.askNoise, 'hex'))
  }, 500)
}

//  const parser = port.pipe(new Readline({ encoding: 'hex', delimiter: 'FD' }))

//  main
function main() {

  port.on('open', function () {

    console.log('port open. Data rate: ' + port.baudRate)
    port.on('data', function (data) {
      if(data) {
        let dataString = Buffer.from(data).toString('hex')
        var bitsArray = []
        bitsArray.push(data)
        LatestData = dataString.slice(0, -2)  // bitsArray.toString()
        //  console.log(LatestData)
    
        checkIfMod(LatestData)
        checkIfFrq(LatestData)
        checkIfNoise(LatestData)
        port.resume()
      }
      else {
        console.log("No DATA emittet")
      }
    })
  })

  port.on('close', function () {
    console.log('port closed.')
  })
  port.on('error', function () {
    console.log('Serial port error: ' + error)
  })

  //  Express Server init at Port 3005
  app.use(express.static(__dirname + '/public'))

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })
  
  http.listen(config.expressPort, () => {
    console.log('IcomSteuerung listening on : 3005')
  })

  //  SocketIO
  io.on('connection', (socket) => {

    console.log('User connected')
    chn9Int = setInterval(function () {
      askTrForDataInt()
      clearInterval(chn9Int)
    }, 350)

    icom.initPortWrite()

    socket.on('disconnect', () => {
      clearInterval(noiseInt)
      clearInterval(frqInt)
      clearInterval(modInt)
      console.log('User disconnected!')
    })

    socket.on('change mod', (data) => {
        icom.cmod = data
        icom.changeMod(data)
        port.write(Buffer.from(icomCmd.askMod, 'hex'))
    })

    socket.on('chnEnter', (data) => {
      chnSelected = parseInt(data)
      icom.changeChn(data)
    })

    socket.on('minus', (data) => {
      icom.chnMinus(data)
    })

    socket.on('plus', (data) => {
      icom.chnPlus(data)
    })
    
    socket.on('chnEnter', (data) => {
      icom.changeChn(data)
    })

    socket.on('shutdown', () => {
      // Shutdown Computer
      shutdown(function(output){
        console.log(output);
      })
    })

  })
}

init()
main()
