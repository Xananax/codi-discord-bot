const UIDGenerator = require('uid-generator')
const random = require('random')
const safeEval = require('notevil')
const getResources = require('./resources')

const uidgen = new UIDGenerator()

const { load, save } = require('./fs')()

let data = load({ keys:0, entries:[] })
let timer = null

const help = {
  ping:{
    usage:"",
    description:"answers pong"
  },
  remind:{
    usage:"(event)",
    description:"reminds you of the event when needed"
  },
  count:{
    usage:"(time:number) (unit:s|m|h|d) ?(text:string)",
    description:"displays {text} after {time} has passed"
  },
  keys:{
    usage:"(keys:number) (reason:text) OR log",
    description:"adds keys to the pool"
  },
  random:{
    usage:"number (e.g, \"12\"), role name (e.g. \"mentors\"), or series (e.g. \"a b c d e\")",
    description:"picks a random thing"
  },
  questionroulette:{
    usage:"?(time in minutes) or 'stop' to stop the questionroulette",
    description:"reminds the mentors to ask students a question from time to time"
  },
  keys:{
    usage:"",
    description:"tracks keys earned by students -- NOT IMPLEMENTED YET"
  },
  resources:{
    usage:"(tag:string) or 'tag' to see all tags",
    description:"list resources for a specific tag"
  },
  run:{
    usage:"(js:string)",
    description:"Runs the provided javascript"
  }
}

const helpToSpec = ( name, { usage, description } ) => "**"+name+"**\n```swift\n!"+name+" "+usage+"\n```\n"+description
const helpToSpecSummary = ( name, { description } ) => "**"+name+"**: "+description
const makeMention = ({username, discriminator, id}) => `<@${id}>` //`@${username}#${discriminator}`

const commands = {
  
  help({ author, mentions, args, content, botIsMentioned, reply, replyLater }){
    const [ rawCommand ] = args
    if(!rawCommand){
      return reply(" - "+Object.keys(help).map(name=> helpToSpecSummary(name, help[name]) ).join( "\n- " ) )
    }
    const command = rawCommand.trim().toLowerCase()
    if(help[command]){ 
      return reply(helpToSpec(command,help[command]))
    }
    reply("I don't know the command `"+command+"`")
  },
    
  ping({ author, mentions, args, content, botIsMentioned, reply, replyLater }){
    reply("pong!")
  },
    
  count({ author, mentions, args, content, botIsMentioned, reply, replyLater }){
    const [ amount, unit, ...rest ] = args
    if(!unit){
      return reply(`you need to specify a unit for \`${amount}\`! One of: s, m, h, d`)
    }
    if(!/s|m|h|d/.test(unit[0])){
      return reply(`I can't wait ${amount} of ${unit}! I don't know ${unit}`)
    }
    const text = rest.join(' ')
    const delay = amount * ( unit==="s" ? 1000 : unit === "m" ? 1000*60 : unit === "h" ? 1000*60*60 : unit === "d" ? 1000*60*60*24 : 1000 )
    const msg = makeMention(author) + " " + text 
    replyLater(delay)(msg)
    const summary = rest.length > 10 ?  rest.slice(0,10)+'...' : text
    reply( text ? "ok, will ping you about `"+ summary +"` in "+amount+unit : "ok, will ping you in "+amount+unit)
  },
  
  getrole({ reply, args, guildRoles, members, isPrivateMessage }){
    if(isPrivateMessage){ return reply('sorry, this command makes no sense out of the channel')}
    const [ roleName ] = args;
    
    const role = guildRoles.find( ( {name} ) => name === roleName )
    
    if(!role){
      return reply("role `"+roleName+"` not found")
    }
    reply("role `"+roleName+"` has the id `"+role.id+"`") 
  },
  
  getusers({ reply, args, guildRoles, members, isPrivateMessage }){
    if(isPrivateMessage){ return reply('sorry, this command makes no sense out of the channel')}
    const [ roleName ] = args;
    
    const role = guildRoles.find( ( {name} ) => name === roleName )
    
    if(!role){
      return reply("role `"+roleName+"` not found")
    }
    const roleMembers = "```\n{\n"+members
      .filter(( {roles} ) => roles.indexOf(role.id)>=0)
      .map(({ nick, user:{id, username, discriminator }})=>`${id}:"${nick||username}"`).join(',\n')
      + "\n}\n```\n";
    
    reply(roleMembers)
  },
  
  questionroulette({ reply, args, guildRoles, members, isPrivateMessage }){
    if(isPrivateMessage){ return reply('sorry, this command makes no sense out of the channel')}
    if(args[0] === 'stop'){
      clearTimeout(timer);
      return reply("questions timer stopped")
    }
    
    const [ _role, _delay] = args;
    
    const roleName = _role || 'prairie'
    const role = guildRoles.find( ( {name} ) => name === roleName )
    
    if(!role){
      return reply("role `"+roleName+"` not found")
    }
    
    const minutes = _delay || 1
    const delay = 1000 * 60 * minutes
    
    if(isNaN(delay)){
        return reply("delay `"+_delay+"` makes no sense")
    }
    
    const every = () => {
      clearTimeout(timer);
      timer = setTimeout( () => {
        const roleMembers = members.filter(( {roles} ) => roles.indexOf(role.id)>=0)
        const { nick, user:{id, username, discriminator } } = roleMembers[random.int(0,roleMembers.length-1)]
        reply("<@392614306421669889>, ask "+(nick||username)+" a question!")
        every();
      },delay)
    }
    every()
    
    reply("I will ask one student to ask one question every `"+minutes+"` "+(minutes>1?"minutes":"minute"))
  },
  
  random({ reply, args, guildRoles, members, isPrivateMessage }){
    if(!args.length){
      return reply(random.int(0,100))
    }
    if(args.length == 1){
      if(/\d+/.test(args[0])){
        return reply("`"+random.int(0,parseInt(args[0]))+"`")
      }
      if(args[0] === 'dice'){
        return reply("`"+random.int(0,6)+"`")
      }
      if(isPrivateMessage){ return reply('sorry, this command makes no sense out of the channel')}
      const role = guildRoles.find( ( {name} ) => name === args[0] ) 
      if(!role){
        return reply("I don't know this role")
      }
      const roleMembers = members.filter(( {roles} ) => roles.indexOf(role.id)>=0)
      const { nick, user:{id, username, discriminator } } = roleMembers[random.int(0,roleMembers.length-1)]
      return reply(""+(nick||username)+", I choose you!")
    }
    if(args.length > 2 && args[0] === 'iterate'){
      const n = parseInt(args[1]);
      if(isNaN(n)){
        return reply("you have to specify an amount of iterations")
      }
      if(n>100000){
        return reply("this is too big of a number")
      }
      const picks = args.slice(2);
      const obj = {}
      picks.forEach( pick => obj[pick] = 0 )
      let iterations = n
      const size = args.length-1
      while(iterations){
        const pick = picks[random.int(0,size)]
        obj[pick]++
        iterations--
      }
      const answer = picks.map(pick=>`${pick}: \`${obj[pick]}\``).join(';')
      return reply('Over `'+n+'` iterations, those are the results: '+answer)
    }
    return reply("I choose `"+args[random.int(0,args.length-1)]+"`")
  },
  
  remind({ author, mentions, args, content, botIsMentioned, reply, replyLater }){
    const { eventTitle, startDate, endDate, isAllDay } = require( 'sherlockjs' ).parse( args.join(' ') )
    const date = startDate ? startDate : endDate
    if(!date){ return reply("I didn't get this") }
    const start = date.getTime() - Date.now()
    const text = eventTitle.replace(/^me\s+/,'').replace(/^to\s+/,'')
    replyLater(start)(text)
    reply("I will remind you to `"+text+"` on "+date)
  },
  run:({ reply, args })=> {
    const strings = []
    const log = (...what) => strings.push(what.join(' '))
    const context = { log, console:{log} }
    const toEvaluate = args.join(' ').replace(/^`+\w*?\n|`+$/g,'')
    try{
      const ret = safeEval(toEvaluate,context);
      const lines = strings.length ? "*log:*\n```js\n"+strings.join('\n')+"\n```\n" : ''
      const result = ( typeof ret !== 'undefined' ? "*result:*\n```js\n"+JSON.stringify(ret,null,2)+"\n```\n" : '' ).replace(/`/g,'\`')
      reply(result+lines)
    }catch(e){
      console.log('sdfsdf')
      reply('**ERROR**\n```js\n'+e.message+'\n```\n')
    }
  },
  resources({ author, roleMentions, mentions, args, content, botIsMentioned, reply, replyLater }){
    reply(getResources(args))
  },
  
  keys({ author, roleMentions, mentions, args, content, botIsMentioned, reply, replyLater, isPrivateMessage}){
    if(isPrivateMessage){ return reply('sorry, this command makes no sense out of the channel')}
    const [ _amount, ...reasonArr ] = args
    if(_amount === 'log' || (!_amount && !reasonArr.length)){
      const prev = reasonArr[0] && parseInt(reasonArr[0]) || 3
      const text = 'displaying the last '+prev+' entries:\n```\n'+data.entries.slice(prev*-1).reverse().map(({entry,amount,total})=>(entry+' \t| '+(amount>0?`+${amount}`:amount))).join(`\n`)
      
        + "\n```\n**Total** 🔑: "+data.keys
      return reply(text)
    }
    
    if( !author.roles.find( ( {name} ) => name === 'mentors' ) ){
      return reply(`you're not allowed to use this, <@${ author.id }>`)
    }
    
    const reason = reasonArr.join(' ')
    const isNegative = (_amount[0] === '-')
    const amount = parseInt(  isNegative ? _amount.slice(1) : _amount )
    
    if(isNaN(amount)){
      return reply("I don't understand")
    }
    
    const num = amount * (isNegative ? -1 : 1)
    
    
    uidgen.generate()
      .then( id => {
      
        const { keys:prevKeys, entries } = data
        const keys = prevKeys + num
    
          const logEntry = {
            id,
            index:entries.length,
            date: new Date(),
            amount: num,
            entry: mentions.map(({id})=>`<@${id}>`).join(',') + ' ' + reason,
            previous: prevKeys,
            total: keys
          }

        data = { ...data, keys, entries:[ ...entries, logEntry ] }

        save(data)

        const text = JSON.stringify(logEntry, true, 2)

        reply("```json\n"+text+"\n```")
      })
    
  }
  
}

const levenshtein = require('fast-levenshtein');
const commands_list = Object.keys(commands)
const find_close_sounding_command = (attempt, level = 1) => commands_list.filter(command => levenshtein.get(attempt, command) <= level )

const command_not_found = (command, reply) => {
  const possibilities = find_close_sounding_command(command,2)
  const { length } = possibilities
  const proposal = 
    ( length
    ? ( length > 1 
      ? ` Did you mean one of these? \`${possibilities.join(',')}\`` 
      : ` Did you mean \`${possibilities[0]}\`?`
      ) 
    : ''
    )
  return reply(`I don't know what you want.${proposal}`)
}

const run = ({ command, isCommand, ...props }) => commands[command] ? commands[command](props) : command_not_found(command,props.reply)

run.commands = commands

module.exports = run