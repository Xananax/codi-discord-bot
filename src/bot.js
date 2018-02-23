const { sanitize_command } = require('./utils/sanitize_command')
const { parse_command } = require('./utils/parse_command')
const { log } = require('./utils/log')
const { handler } = require('./handler/handler')

module.exports = ( bot ) => {

  const member_is_self = ( member ) => ( member.id == bot.user.id )

  const receive = ( msg ) => {
    
    if(member_is_self(msg.member)){ return; }

    const text = msg.content
    const sanitized_text = sanitize_command(text)
    
    if( !text ){ return }
    
    const reply = (answer) => bot.createMessage(msg.channel.id, answer)
    const reply_later = ( text, time = 1000 ) => setTimeout(reply.bind(null,text),time)

    const [ command, args ] = parse_command(sanitized_text)

    const { mentions, member:source } = msg

    let botIsMentioned = false
    const botIndex = mentions.findIndex(member_is_self)


    if(botIndex >=0 ){
      mentions.splice(botIndex,1)
      botIsMentioned = true
    }

    const props = { source, mentions, command, args, text, reply, botIsMentioned, reply_later }

    handler(props)
  }

  return receive
}