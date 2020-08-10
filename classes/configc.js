const editJsonFile = require("edit-json-file")
let path = require('path')
let cfgData = require("../config/config.json")
const { fstat } = require("fs")
let file = editJsonFile(path.join(__dirname, '../config/config.json'))
let fs = require("fs")

class Configc {
  constructor(path/*, obj*/) {
    this.path = path
    //this.obj = obj  //  example: { name: 'JP' }
  }
  read(pathToFile) {
    return JSON.parse(fs.readFileSync(pathToFile))
  }

  write(key, value) {
    file.set(key, value)
    file.save()
    console.log("Wrote " + key + " " + value + " to " + this.path + " ")
  }
}

let cfg = new Configc('../config/config.json')

module.exports = cfg