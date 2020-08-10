const editJsonFile = require("edit-json-file")
let path = require('path')
let cfgData = require("../config/config.json")
let file = editJsonFile(path.join(__dirname, '../config/config.json'))

class Configc {
  constructor(path/*, obj*/) {
    this.path = path
    //this.obj = obj  //  example: { name: 'JP' }
  }
  read(key) {
    data = file.read()
    return data.key
  }

  write(key, value) {
    file.set(key, value)
    file.save()
    console.log("Wrote " + key + " " + value + " to " + this.path + " ")
  }
}

let cfg = new Configc('../config/config.json')

module.exports = cfg