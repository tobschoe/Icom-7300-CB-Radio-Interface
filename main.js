const port = require('./js/serial')
let config = require('./config/config.json')
let icomCmd = require("./js/var")
let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http)
let express = require('express')
let exec = require('./js/exec.js')
let kill = require('./js/kill.js')
let Tr = require("./classes/tr")
const cfg = require('./classes/configc')
let icom = new Tr
let path = require('path')

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

    socket.on('cfg-change', (data) => {
      let pream = ""
      let prefm = ""
      let pressb = ""
      for (let i = 0; i < 3; i++){
        if (data.defaultRfPoweram.length + pream.length < 4) {
          pream += "0"
        }
        if (data.defaultRfPowerfm.length + prefm.length < 4) {
          prefm += "0"
        }
        if (data.defaultRfPowerssb.length + pressb.length < 4) {
          pressb += "0"
        }
      }
      config.addrIcom = data.addrIcom
      config.defaultRfPoweram = pream + data.defaultRfPoweram
      config.defaultRfPowerssb = pressb + data.defaultRfPowerssb
      config.defaultRfPowerfm = prefm + data.defaultRfPowerfm
      config.fmTxRxFilterSwitcher = data.fmTxRxFilterSwitcher
      config.defaultFMTxFilter = data.defaultFMTxFilter
      config.defaultFMRxFilter = data.defaultFMRxFilter
      config.autoChnNine = data.autoChnNine
      config.baudrate = data.baudrate
      config.expressPort = data.expressPort
      cfg.write("addrIcom", data.addrIcom)
      cfg.write("defaultRfPoweram", pream + data.defaultRfPoweram)
      cfg.write("defaultRfPowerfm", prefm + data.defaultRfPowerfm)
      cfg.write("defaultRfPowerssb", pressb + data.defaultRfPowerssb)
      cfg.write("fmTxRxFilterSwitcher", data.fmTxRxFilterSwitcher)
      cfg.write("defaultFMTxFilter", data.defaultFMTxFilter)
      cfg.write("defaultFMRxFilter", data.defaultFMRxFilter)
      cfg.write("autoChnNine", data.autoChnNine)
      cfg.write("baudrate", parseInt(data.baudrate))
      cfg.write("expressPort", parseInt(data.expressPort))

      //  Set RF Power
      if (icom.cmod == "USB" || "LSB") {
        port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPowerssb + icomCmd.sendPost, 'hex'))
      }
      if (icom.cmod == "FM") {
        port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPowerfm + icomCmd.sendPost, 'hex'))
      }
      if (icom.cmod == "AM") {
        port.write(Buffer.from(icomCmd.sendPre + icomCmd.setModPre + config.defaultRfPoweram + icomCmd.sendPost, 'hex'))
      }
      //  Set RX Filter
      icom.changeFMFilter(config.defaultFMRxFilter)

    })

    socket.on('cfg-get', () => {
      io.emit('cfg-load', config)
    })

    //  process.exit()
    socket.on('return-to-os', () => {
      kill(function(output){
        console.log(output);
      })
    })
    
    io.emit('cfg-load', config)

    socket.on('shutdown', () => {
      let data = cfg.read(path.join(__dirname, './config/config.json'))
      console.log(data.shutdownCmd)
      // Shutdown Computer
      exec(data.shutdownCmd, function(output){
        console.log(output);
      })
    })

  })
}

init()
main()
