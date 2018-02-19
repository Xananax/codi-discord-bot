module.exports = ( dirname = __dirname, filename=__filename,  root = '', handlers = {} ) => {
  const path = require('path') 
  const dir = path.join( dirname, root )
  const index_file = path.join( dir, 'index.js' )
  require('fs').readdirSync(dir)
    .filter( file => {
      const curr = path.join(dir,file)
      return ( /\.js/.test(file) && curr !== filename && curr !== index_file )
    } )
    .map( file => file.replace(/\.js/,'') )
    .forEach( file => handlers[file] = require(path.join(dir,file+'.js')))
  return handlers;
}