const { sanitize_command } = require('./utils/sanitize_command')
const { parse_command } = require('./utils/parse_command')
const { log } = require('./utils/log')
const { handler } = require('./handler/handler')

module.exports = ( bot ) => {

  const message_originator_is_self = ( message ) => ( message.member.id == bot.user.id )

  const receive = ( msg ) => {
    
    if(message_originator_is_self(msg)){ return; }

    const text = msg.content
    const sanitized_text = sanitize_command(text)
    
    if( !text ){ return }
    
    const reply = (answer) => bot.createMessage(msg.channel.id, answer)
    
    const [ command, args ] = parse_command(sanitized_text)

    const { mentions, member:source } = msg

    const props = { source, mentions, command, args, text, reply }

    handler(props)
  }

  return receive
}