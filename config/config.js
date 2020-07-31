var config = {};

//Default RF Power in Percent
// 0000 = 0% / 0255 = 100%
config.defaultRfPoweram = "0040";  
config.defaultRfPowerfm = "0026";
config.defaultRfPowerssb = "0051";

//FM-TX-RX-Filter-Switcher : 
//Changes your Fm filter while sending and recieving. (Smaller filter while RX, wider filter while Tx)
config.fmTxRxFilterSwitcher = false;  //true or talse

module.exports = config;