const { sanitize_command } = require('./utils/sanitize_command')
const { parse_command } = require('./utils/parse_command')

const checkMessage = ( bot ) => {

  const message_originator_is_self = ( message ) => ( message.member.id == bot.user.id )

  const receive = ( msg ) => {
    
    if(message_originator_is_self(msg)){ return; }

    const text = sanitize_command(msg.content)
    
    if( !text ){ return }
    
    const reply = (answer) => bot.createMessage(msg.channel.id, answer)
    
    if(text in answers){
      return reply(answers[text])
    }
    
    if(msg.content[0] !== command_character){return; }
    
    
    console.log(_command, command)
    if(!command){
      return reply(`you did not provide any command!`)
    }
    
    //console.log(text, `--${command}--`, commands, command in commands)
    
    if(!(command in commands)){
      return command_not_found(command,reply)
    }
    
    const { mentions, member } = msg
    
    if(!member){
      return reply(`you are not allowed to talk to me outside of the server`)
    }
    
    const { allow, run } = commands[command]
    
    const is_allowed = allow(msg)
    
    if(!is_allowed){
      return reply(`you are not allowed to run \`${command}\``)
    }
    
    get_or_create_user(member)
      .then(source =>
        Promise.all(mentions.map(get_or_create_user))
          .then(mentions=>({source,mentions,reply,args}))
          .catch(err=>{throw err})
      )
      .then(run)
      .catch(err=>{reply(`there was an error: ${err ? err.message : '?'}`)})
    
    }
}