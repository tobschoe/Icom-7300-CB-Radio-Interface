var config = require('./config/config');
const Delimiter = require('@serialport/parser-delimiter')
const SerialPort = require('serialport')
const ByteLength = require('@serialport/parser-byte-length')
var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
var LatestData = "";
const port = new SerialPort('COM3', function (err) {
    if (err) {
      return console.log('Error: ', err.message)
    }
  }, 

  {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    Parity: "none",
    flowControl: false
}
  );

  
function showPortOpen() {
    console.log('port open. Data rate: ' + port.baudRate);
 }
  
 function showPortClose() {
    console.log('port closed.');
 }
  
 function showError(error) {
    console.log('Serial port error: ' + error);
 }

port.on('open', showPortOpen);
port.on('close', showPortClose);
port.on('error', showError);

 const parser = port.pipe(new Readline({encoding: "hex", delimiter: "FD"}))
 parser.on('data', function(data) { 
     //console.log("Raw Data: " + data);
    var bitsArray = []
    bitsArray.push(data)
    //console.log(bitsArray.toString())
    LatestData = bitsArray.toString()

    checkIfMod(LatestData)
    isDataFrequ(LatestData)
    checkIfNoise(LatestData)

})

//--FEFE94E00600FD -> FEFE = Funciton Prefix, 94 = Trx address, E0 = Sender address, 06 = Command,  00 = Data, FD = Command END--//

function turnOff () {
    port.write(Buffer.from("FEFE94E01800FD", "hex"), function (err, result) {
        if (err) {
            console.log('Error while sending message : ' + err);
        }
        if (result) {
            console.log("Result: "+result);
        }
    })
}

function fm () {
    port.write(Buffer.from("FEFE94E0060502FD", "hex"), function (err, result) {
        if (err) {
            console.log('Error while sending message : ' + err);
        }
    })
}


function am () {
        port.write(Buffer.from("FEFE94E00602FD", "hex"), function (err, result) {
            if (err) {
                console.log('Error while sending message : ' + err);
            }
        })
}

function usb () {
    port.write(Buffer.from("FEFE94E00601FD", "hex"), function (err, result) {
        if (err) {
            console.log('Error while sending message : ' + err);
        }
    })
}

function lsb () {
    port.write(Buffer.from("FEFE94E00600FD", "hex"), function (err, result) {
        if (err) {
            console.log('Error while sending message : ' + err);
        }
    })
}

function getFrq (LatestData) {
    // example string "fefe0094000000072700";
    if (LatestData != undefined && LatestData != null) {
        var res = LatestData.split("");
        formFrq = res[res.length-4] + res[res.length-3] + "." + res[res.length-6] + res[res.length-5]  + res[res.length-8] + "." +  res[res.length-7] + res[res.length-10];
        io.emit('frq', formFrq)
    }
}

function isDataFrequ(LatestData) {

    if(LatestData.length == 20 ) {
        getFrq(LatestData)
    }

}

function checkIfMod(LatestData) {

    switch(LatestData.slice(0, -2)) {
        case "fefee0940401":
        case "fefe00940101":
            io.emit("cMod", "USB") 
            cMod = "USB"
            //change rf power FEFE94E0140A0026FD = Default FM FEFE94E0140A0051FD ) Default SSB
            port.write(Buffer.from("FEFE94E0140A"+config.defaultRfPowerssb+"FD", "hex"))
          break;
        case "fefee0940400":
        case "fefee00940100":
            io.emit("cMod", "LSB") 
            cMod = "LSB"
            port.write(Buffer.from("FEFE94E0140A"+config.defaultRfPowerssb+"FD", "hex"))
          break;
        case "fefee0940402":
        case "fefe00940102":
            io.emit("cMod", "AM") 
            cMod = "AM"
            port.write(Buffer.from("FEFE94E0140A"+config.defaultRfPoweram+"FD", "hex"))
            break;
        case "fefee0940405":
        case "fefe00940105":
            io.emit("cMod", "FM") 
            cMod = "FM"
            port.write(Buffer.from("FEFE94E0140A"+config.defaultRfPowerfm+"FD", "hex"))
            break;
      } 
}

function getNoise() {
    //cmd 15 subcmd 02 data 0000 to 0255 *(0000=S0, 0120=S9, 0241=S9+60dB)  FEFE94E01502FD 
    port.write(Buffer.from("FEFE94E01502FD", "hex"))
}

var isTx = 0;
var defaultFMTxFilter = "FEFE94E0060501FD" // 01 filter
var defaultFMRxFilter = "FEFE94E0060502FD" // 02 filter
var cMod = "";

function checkIfNoise(LatestData) {
    if (LatestData.length == 16){
        io.emit("noise", LatestData.slice(-3)) 
        //LatestData.slice(-3)
        noiselevelInt = parseInt(LatestData.slice(-3));
        if (cMod == "FM") {                                         //Check if Mod is FM 
            if (noiselevelInt <= 1 && isTx == 0){
                if (config.fmTxRxFilterSwitcher == true) {
                    changeFMFilter(defaultFMTxFilter)
                }
                isTx = 1
                console.log("TXING");
            }
            if (noiselevelInt > 1 && isTx == 1){
                if (config.fmTxRxFilterSwitcher == true) {
                    changeFMFilter(defaultFMRxFilter)
                }
                isTx = 0
                console.log("RXING");
            }
        }
    }
}

function changeFMFilter(filter) {
    port.write(Buffer.from(filter, "hex"))
}
//////EXPRESS
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var express = require("express");
const { type } = require('os');
const { strict } = require('assert');

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//////Socket
io.on('connection', (socket) => {
    console.log("User connected");

    //go to chn 9 with filter 2
    chn9Int = setInterval(function(){
        port.write(Buffer.from("FEFE94E0000050062700FD", "hex")) // Set chn 9
        port.write(Buffer.from("FEFE94E0060502FD", "hex"))      // Set Filter 2 FM
        port.write(Buffer.from("FEFE94E0140A"+config.defaultRfPowerfm+"FD", "hex")) //setRFpower to defualt fm
        cMod = "FM" 
        clearInterval(chn9Int)
    }, 350)

        modInt = setInterval(function(){
            port.write(Buffer.from("FEFE94E004FD", "hex")) //On connect check current modulation
            clearInterval(modInt)
        }, 1200)

        frqInt = setInterval(function(){
            port.write(Buffer.from("FEFE94E003FD", "hex")) //On connect check current frequency
            clearInterval(frqInt)
        }, 1000)

        //noise level loop
        noiseInt = setInterval(function () {
            getNoise()
        },300)

       /* //is transcieving? Q: FEFE94E01C00FD Answer: FEFEE0941C0000FD
        trxInt = setInterval(function () {
            
        },500)*/

        socket.on('disconnect', () => {
            clearInterval(noiseInt)
            clearInterval(frqInt)
            clearInterval(modInt)
            console.log("User disconnected!");
        });

    //On chat message (Currently disabled for normal user)  
    socket.on('change mod', (mod) => {
        if (mod == "fm") {
            console.log("Changed mod to fm");
            cMod = "FM"
            fm();
            port.write(Buffer.from("FEFE94E004FD", "hex"))
        }
        if (mod == "am") {
            console.log("Changed mod to am");
            cMod = "AM"
            am();
            port.write(Buffer.from("FEFE94E004FD", "hex"))
        }
        if (mod == "usb") {
            console.log("Changed mod to usb");
            cMod = "USB"
            usb();
            port.write(Buffer.from("FEFE94E004FD", "hex"))
        }
        if (mod == "lsb") {
            console.log("Changed mod to lsb");
            cMod = "LSB"
            lsb();
            port.write(Buffer.from("FEFE94E004FD", "hex"))
        }
    });
    socket.on('command', (cmd) => {
        if (cmd == "test"){
            test()
        }
        else
        console.log("Command = "+cmd);
        port.write(Buffer.from(cmd, "hex"), function (err, result) {
            if (err) {
                console.log('Error while sending message : ' + err);
            }
        })
    })
        
    const chnAr = ["0", "26.965.00", "26.975.00", "26.985.00", "27.005.00", "27.015.00", "27.025.00", "27.035.00", "27.055.00", "27.065.00", "27.075.00", "27.085.00", 
    "27.105.00", "27.115.00", "27.125.00", "27.135.00", "27.155.00", "27.165.00", "27.175.00", "27.185.00", "27.205.00", "27.215.00", "27.225.00", "27.255.00", "27.235.00", 
    "27.245.00", "27.265.00", "27.275.00", "27.285.00", "27.295.00", "27.305.00", "27.315.00", "27.325.00", "27.335.00", "27.345.00", "27.355.00", "27.365.00", "27.375.00", 
    "27.385.00", "27.395.00", "27.405.00"]

    function changeChn(channel){
        chString = chnAr[channel]
        if (chString == undefined) {
            return
        }
        var y = chString.replace(".", "")
        var z = [];
        z[1] = y.substr(6, 2);
        z[2] = y.substr(4, 2);
        z[3] = y.substr(2, 2);
        z[4] = y.substr(0, 2);
		a = z.join("");
        b = a.replace(".", "0")
        newChannelString = "FEFE94E005"+b+"00FD"
        port.write(Buffer.from(newChannelString, "hex"))
        port.write(Buffer.from("FEFE94E003FD", "hex"))
    }

    socket.on('minus', (data) => {
        port.write(Buffer.from("FEFE94E003FD", "hex"))
        var newchannel = chnAr.indexOf(data) - 1;
        if (newchannel == 0) {
            return
        }
        var chString = chnAr[newchannel]
        if (chString == undefined) {
            return
        }
        var y = chString.replace(".", "")
        var z = [];
        z[1] = y.substr(6, 2);
        z[2] = y.substr(4, 2);
        z[3] = y.substr(2, 2);
        z[4] = y.substr(0, 2);
		a = z.join("");
        b = a.replace(".", "0")
        newChannelString = "FEFE94E005"+b+"00FD"
        port.write(Buffer.from(newChannelString, "hex"))
        port.write(Buffer.from("FEFE94E003FD", "hex"))
    })
//Change frequ to command: FEFE94E005 00500627 00FD CHANGE to 27.065.00      00500627
    socket.on('plus', (data) => {
        port.write(Buffer.from("FEFE94E003FD", "hex"))
        var newchannel = chnAr.indexOf(data) + 1;
        if (newchannel == 41) {
            return
        }
        var chString = chnAr[newchannel]
        if (chString == undefined) {
            return
        }
        var y = chString.replace(".", "")
        var z = [];
        z[1] = y.substr(6, 2);
        z[2] = y.substr(4, 2);
        z[3] = y.substr(2, 2);
        z[4] = y.substr(0, 2);
		a = z.join("");
        b = a.replace(".", "0")
        newChannelString = "FEFE94E005"+b+"00FD"
        port.write(Buffer.from(newChannelString, "hex"))
        port.write(Buffer.from("FEFE94E003FD", "hex"))
    })

    //Go to channel selected by overlay
    socket.on('chnEnter', (data) => {
        chnSelected = parseInt(data)
        changeChn(data)
    })

  });


http.listen(3005, () => {
    console.log('IcomSteuerung listening on : 3005');
  });