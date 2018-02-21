const require_all = require('../utils/require_all')
const { get_or_create_multiple_users, get_or_create_user } = require('../data/user')
const handlers = require_all(__dirname,__filename)

const handler = ( props ) => {
  const { command } = props
  const handler = handlers[command]
  if(handler && handler.run){
    if(!handler.allow(props)){
      return reply(`you are not allowed to run this command`)
    }
    const mentions = get_or_create_multiple_users(props.mentions).value()
    const source = get_or_create_user(props.source).value()
    return handler.run({...props, mentions, source })
  }else{
    reply(`command could not be found`)
  }
}

module.exports = { handler }