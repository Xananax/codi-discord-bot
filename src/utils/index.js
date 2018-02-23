const handlers = {}
require('fs').readdirSync(dir)
  .filter( file => {
    const curr = require('path').join(__dirname,file)
    return ( /\.js/.test(file) && curr !== __filename)
  } )
  .map( file => file.replace(/\.js/,'') )
  .forEach( file => handlers[file] = require(`./${file}.js`))

module.exports = handlers