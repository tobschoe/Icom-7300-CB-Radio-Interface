// --FEFE94E00600FD -> FEFE = Funciton Prefix, 94 = Trx address, E0 = Sender address, 06 = Command,  00 = Data, FD = Command END--//

const config = require("../config/config.json")

const icomCmd = {}

icomCmd.sendPre = "FEFE" + config.addrIcom + config.addrContr
icomCmd.sendPost = "FD"

icomCmd.getPre1 = "fefe0" + config.addrIcom
icomCmd.getPre2 = "fefe00" + config.addrIcom

icomCmd.setModPre = "140A"

icomCmd.askMod = "FEFE" + config.addrIcom + config.addrContr + "04FD"
icomCmd.askFrq = "FEFE" + config.addrIcom + config.addrContr + "03FD"
icomCmd.askNoise = "FEFE" + config.addrIcom + config.addrContr + "1502FD"

icomCmd.mods = {
  "FM": "0605",
  "AM": "0602",
  "USB": "0601",
  "LSB": "0600"
}

icomCmd.chnAr = ['0', '26.965.00', '26.975.00', '26.985.00', '27.005.00', '27.015.00', '27.025.00', '27.035.00', '27.055.00', '27.065.00', '27.075.00', '27.085.00',
'27.105.00', '27.115.00', '27.125.00', '27.135.00', '27.155.00', '27.165.00', '27.175.00', '27.185.00', '27.205.00', '27.215.00', '27.225.00', '27.255.00', '27.235.00',
'27.245.00', '27.265.00', '27.275.00', '27.285.00', '27.295.00', '27.305.00', '27.315.00', '27.325.00', '27.335.00', '27.345.00', '27.355.00', '27.365.00', '27.375.00',
  '27.385.00', '27.395.00', '27.405.00']

module.exports = icomCmd