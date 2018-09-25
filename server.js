const Eris = require('eris');
const commands = require('./commands')
const app = require('express')()

/**
 * logs anything and returns the first passed item, useful for fp logging
 * @param { string } text a title for the log line
 * @param { ...any } things to log
 * @return any the first logged thing
 **/
const log = text => ( ret, ...what ) => ( console.log( `[ ${text} ] `, ...what ), ret)

/**
 * Parses a line of text into command and arguments.
 * cleans up extra spaces and splits on spaces.
 * A command is only parsed if it begins with "!"
 * @param { string } text the passed line of text
 * @return { [ string, string[] ] } the command, and the array of arguments
 **/
const parseCommand = text => {
  const parts = text.split(' ')
  if( parts[0][0] === '!'){
    const [ rawCommand, ...args] = parts
    const command = rawCommand
      .replace( /\n+/g, '' )
      .replace(/^!/,'') // replace starting "!"
      .replace( /\s+/g, '' )
      .trim()
      .toLowerCase()
    return [ command, args ]
  }
  return [ '', parts ]
}

/**
 * Cleans a received message
 * replaces slashes, extra spaces, removes the command character
 * @param { string } msg the received message
 * @return { string } the cleaned message
 **/
const cleanMessage = msg => (
  msg
  .replace(/^\/*|\/*$/g,'') //remove starting and ending slash
  .trim() //remove starting and ending space
  .replace(/^!(.*?)\s|\n/,'!$1 ')
  .replace(/<.*?>/g,'') //replace mentions
  .replace(/(\s)+/g,'$1') // replace double spaces with single spaces
  .replace(/^todo:?\s?/,'todo ')
  .trim() // remove starting and ending space again
)

const translateProps = (msg) => {
  
  const isPrivateMessage = msg.channel.type === 1 
  
  const { 
    content, 
    channel:{ id:channelId },
    author: {
      id:userId,
      username,
      discriminator,
      avatar
    },
    mentions
  } = msg
  
  const author = { id:userId, username, discriminator, avatar}
  const channel = {id:channelId}
  const cleanedText = cleanMessage( content )
  
  let props = { content, channel, author, mentions, isPrivateMessage, cleanedText }
  
  if(!isPrivateMessage){  
    const { 
      member: {
        roles:userRoles
      }, 
      channel: {
        name,
        topic,
        guild: {
          roles:guildRoles,
          members
        }
      },
      roleMentions:_roleMentions
    } = msg 

    const findRole = roleId => guildRoles.find( role => role.id === roleId)
    const roles = userRoles.map( findRole ).map(({id,name})=>({id,name,role:true})) //mapping ids to role names
    const roleMentions = _roleMentions.map(findRole).map(({id,name})=>({id,name}))
    props = { ...props, author:{...props.author,roles}, channel:{...props.channel, name, topic},roleMentions, guildRoles, members, findRole }
  }
  return props
}

/**
 * Returns a function that:
 * Takes a messages as formatted by Eris, and prepares it
 * for commands. 
 * Returns an object that has the following keys:
 * - author: the author who sent the message
 * - mentions: an array of mentions
 * - roleMentions: an array of roles that were mentioned
 * - command: { string } the first element of the message
 * - isCommand: { boolean } if the first word began with "!"
 * - args: { string[] } the rest of the message
 * - content: { string } original text content
 * - reply: { string => void } lets the bot reply in the same channel
 * - replyLater: { int => string => void } lets the bot reply with a delay of int milliseconds
 * - botIsMentioned: { boolean } if the both themselves were mentioned
 * @param { ErisMessage } msg the message as received from Eris
 * @return { props } the properties described above
 * @param { ErisBot } bot the bot as created by Eris
 * @return { ErisMessage => props } a function that parses Eris Messages into props
 **/
const preparePropsForBot = bot => msg => {
  
  const props = translateProps(msg)
  
  const memberIsSelf = user => ( user.id == bot.user.id )
  
  // if the message is empty, or by the bot themselves, do nothing
  if( !props.content || !props.cleanedText || memberIsSelf( props.author ) ){ return false }

  const reply = answer => bot.createMessage( props.channel.id, answer )
  const replyLater = time => text  => setTimeout( () => reply(text), time )
  
  // extract the command and it's arguments from the passed text
  const [ command, args ] = parseCommand( props.cleanedText )
  const isCommand = !!command
  // find if the bot themselves is mentioned. If they are, remove this mention
  
  const botMentionIndex = props.mentions.findIndex( memberIsSelf )
  const botIsMentioned = ( botMentionIndex >= 0 )
  botIsMentioned && props.mentions.splice( botMentionIndex, 1 )

  // build props to pass to the commands handlers
  return { ...props, command, isCommand, args, botIsMentioned, reply, replyLater }

}

/**
 * a function that does nothing at all
 **/
const noOp = () => {}

/**
 * Sets up an Eris Bot to be a able to parse commands
 * @param { ErisBot } bot the bot as passed by Eris
 **/
const setupBot = bot => {
  
  const prepareProps = preparePropsForBot( bot )
  
  const onMessage = msg => {
 
    let debug = noOp
    
    if(msg.content.slice(0,6) === "debug "){
      msg.content = msg.content.slice(6)
      debug = () => {
        const { reply, replyLater, botIsMentioned,...data } = props
        reply("```json\n"+JSON.stringify(data,true,2)+"\n```\n")
      }
    }
    
    const props = prepareProps( msg )

    if( !props ){ return }
    
    if(props.isCommand){
      commands(props)
      debug()
      return;
    }
    
    require('./answers')(props)
    debug();  
    
  }
  
  bot.on('ready', log('Ready!'))
  bot.on('messageCreate', onMessage)
  bot.connect()

}

setupBot( new Eris( process.env.DISCORD_BOT_TOKEN ) )

app.get('/', (req, res) => {
  res.send('codibot is on')
});
app.get('/query', (req, res) => {
  res.send(require('./query_builder')())
});
app.listen(process.env.PORT || 3000, () => console.log("Listening to port 3000"));
