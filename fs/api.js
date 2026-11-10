const fs = require("fs")
const path = require("path")

const read_file = (fileName) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data", fileName), "utf-8"))
}

const write_file = (fileName, data) => {
  fs.writeFileSync(path.join(__dirname, "../data", fileName), JSON.stringify(data, null, 4))
}

module.exports = {
  read_file,
  write_file
}
