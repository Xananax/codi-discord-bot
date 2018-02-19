const require_all = require('../utils/require_all')
const handlers = require_all(__dirname,__filename)

const handler = ( props ) => {
  const { command } = props
  const handler = handlers[command]
  if(handler && handler.run){
    return handler.run(props)
  }else{
    reply(`command could not be found`)
  }
}

module.exports = { handler }