const editJsonFile = require("edit-json-file")
let serialpathconfig = require("../config/serialpathconfig")
let cfgData = require("../config/config.json")
let file = editJsonFile('./config/config.json')

class Configc {
  constructor(path/*, obj*/) {
    this.path = path
    //this.obj = obj  //  example: { name: 'JP' }
  }
  read() {
    return cfgData
  }

  write(key, value) {
    file.set(key, value)
    file.save()
  }
}

let cfg = new Configc('./config/config.json')

module.exports = cfg