const { log } = require('./log')


const mentor_role_id = '392614306421669889'

const users = load()

const create_user = ( { member:{id,nick,roles,user:{avatar,bot:is_bot, discriminator,username}} } ) => 
Promise.resolve({ //{id,bot,username,discriminator,verified}
  member:{ nick, roles, avatar, is_bot, discriminator},
  id,
  username,
  inventory:{
    gold:0, 
    bonus:0,
    splash:0,
    rp:20,
    pause:0,
    joker:0,
    lootbox:1
  },
  todos:[],
  done:[],
  late:[]
})

const unit_types = ['gold','bonus','splash','rp','time','joker','lootbox']

const lootbox_gifts = 
    [ 'joker', 'joker', 'joker', 'joker',
      'pause', 'pause', 'pause', 'pause',
      'rp', 'rp', 'rp', 'rp', 'rp', 'rp', 'rp', 'rp', 
      'batata', 'rock', 'candy'
    ]

const get_or_create_user = (user) => {
  if(!users[user.id]){
    return create_user(user)
      .then(user => {
        users[user.id] = user
        return user
      })
  }
  return Promise.resolve(users[user.id])
}

const get_user_by_id = (id) => {
  if(!users[id]){
    return Promise.reject(`not found`)
  }
  return users[id]
}

const answers = {
  ba:'tata'
}




const message_originator_has_mentor_role =  ( msg ) => ( msg.member.roles.includes(mentor_role_id) )
const message_originator_is_codibot = ( member ) => ( member.id == '410513144046419984' ) // codibot user id

const command_character = '!'

const checkMessage = (bot) => (msg) => {
  
  if(message_originator_is_codibot(msg)){ return; }
  if(msg.content.slice(0,4) === 'todo'){ msg.content = '!'+msg.content }
  
  const text = sanitize(msg.content)
  
  if( !text ){ 
    return; 
  }
  
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

const HANDLE_RESOURCES_OK = 0
const HANDLE_RESOURCES_NAN = 1
const HANDLE_RESOURCES_NO_UNIT = 2
const HANDLE_RESOURCES_NO_RECEIVER = 3

const handle_resources = (next) => ({reply, args, source, mentions}) => {

  const [,numStr, unit] = args.join('').match(/(\d+)\s*?(\w*)/i) || ['','0','gold']

  const num = parseInt(numStr)

  if(isNaN(num) || num === 0){
    return next(HANDLE_RESOURCES_NAN, {reply, args, source, mentions})
  }

  if(!unit){
    return next(HANDLE_RESOURCES_NO_UNIT, {reply, args, source, mentions})
  }

  if(!mentions.length){
    return next(HANDLE_RESOURCES_NO_RECEIVER, {reply, args, source, mentions})
  }
  console.log(mentions)
  next(HANDLE_RESOURCES_OK, {reply, args, source, mentions, num, unit})
}

const unitSummary = (user,unit) => `<@${user.id}> has \`${user.inventory[unit]}\` ${unit}`

const make_reply_later = (reply) => ( text, time = 1000 ) => setTimeout(reply.bind(null,text),time)

const shop_items = [
  { name:'loot box',
    price:`100 gold`,
    run:( user ) => {
      if(user.inventory.gold<100){ return false }
      user.inventory.lootbox+=1
      user.inventory.gold-=100
      return true
    },
    description:`A box that contains a suprise!`
  }
]

const commands = {
  help:{
    allow:()=>true,
    help:()=>`\`help [command_name:string]\`. Shows this help message`,
    run:({reply, args:[currentCommand]})=>{
      if(currentCommand){
        if(!(currentCommand in commands)){
          return reply(`the command \`${currentCommand}\` does not exist.`)
        }
        return reply(`\`${!command_character}\`:${commands[currentCommand].help()}`)
      }
      const commands_str = commands_list.map(c => ` - \`${command_character}${c}\`:${commands[c].help()}`).join(`\n`)
      reply(`Commands: ${commands_list.join(', ')}\n${commands_str}\n\n ranking at https://codi-discord-bot.glitch.me \n bot code available at: https://glitch.com/edit/#!/join/ba51d9ac-df6b-4b9a-8b80-ff8129719412`)
    }
  },
  inventory:{
    allow:()=>true,
    help:()=>`\`inventory [...@user]\`. Shows your inventory`,
    run:({ source, mentions, reply })=> reply([source, ...mentions].map(({id,inventory:p})=>`<@${id}>'s inventory:\n`+Object.keys(p).map(k=>`\t${k}:${p[k]}\n`).join(``)).join(`\n-------\n`))
  },
  market:{
    allow:()=>true,
    help:()=>`Tells you what's on offer on the market`,
    run:({ source, mentions, reply })=> reply(`ON THE MARKET TODAY:\n`+shop_items.map(({name,description, price},n)=>` - \`${n+1}\` ${name}: ${description} | [\`${price}\`]`).join(`\n`))
  },
  test:{
    allow:()=>true,
    help:()=>`Just a test, answers with a random string`,
    run:({ reply })=>reply(`batata`)
  },
  ping:{
    allow:()=>true,
    help:()=>`Answers "pong"`,
    run:({ reply })=>reply(`batata`)
  },
  give:{
    allow:()=>true,
    help:()=>`\`give (x:num)(unit:string) (@user) [...@user]\` .Give some resource to someone`,
    run:handle_resources((status, { reply, args, source, mentions, num, unit })=>{
      if(status!==HANDLE_RESOURCES_OK){
        switch(status){
          case HANDLE_RESOURCES_NAN:
            return reply(`Sorry, but I can't give \`${num}\` ${unit}`)
          case HANDLE_RESOURCES_NO_UNIT:
            return reply(`yes, but give \`${num}\` what?`)
          case HANDLE_RESOURCES_NO_RECEIVER:
            return reply(`who are you giving ${num} ${unit} to?`)
          default:
            return reply(`unknown error`)
        }
      }

      const remove = num * mentions.length      
      const removeUnit = unit
      const addUnit = unit == 'bonus' ? 'gold' : unit

      const is_mentor = message_originator_has_mentor_role(source)
      
      if(!is_mentor){
        
        if(!(removeUnit in source.inventory)){
          return reply(`you don't have any ${removeUnit}`)
        }
        
        const pool = source.inventory[removeUnit]
        
        if(pool < remove){
          return reply(`You do not have enough ${unit}. You need at least ${remove}, which is ${remove-pool} more`)
        }

        source.inventory[removeUnit] = pool - remove
        
      }
      
      const summary = mentions.map( u => { 
        if(!(addUnit in u.inventory)){
          u.inventory[addUnit]=0 
        }
        u.inventory[addUnit]+=num 
        return `> `+unitSummary(u,unit)
      }).join(`\n`)

      const answer = is_mentor ? summary : `<` + unitSummary(source,removeUnit) + `\n` + summary
      reply(answer)
    }),
  },
  take:{
    allow:( msg )=>true, //TODO: make this usable by mods only
    help:()=>`\`take (x:num)(unit:string) (from:@user)\`. Takes from someone. Only usable by mods`,
    run:handle_resources((status, { reply, args, source, mentions, num, unit })=>{

      if(status!==HANDLE_RESOURCES_OK){
        switch(status){
          case HANDLE_RESOURCES_NAN:
            return reply(`Sorry, but I can't give \`${num}\` ${unit}`)
          case HANDLE_RESOURCES_NO_UNIT:
            return reply(`yes, but give \`${num}\` what?`)
          case HANDLE_RESOURCES_NO_RECEIVER:
            return reply(`who are you giving ${num} ${unit} to?`)
          default:
            return reply(`unknown error`)
        }
      }

      const summary = mentions.map( u => { 
        u.inventory[unit]-=num 
        return `> `+unitSummary(u,unit)
      }).join(`\n`)

      reply(summary)
    })
  },
  buy:{
    allow:()=>true,
    help:()=>`\`buy\ (thing:int)\`. Buys a thing from the market `,
    run:({ reply, source, args })=> {
      const things = args
        .map( n => n-1 )
        .filter( n => !isNaN(n) || n > shop_items.length )
        .map( n => { 
          const {name, run} = shop_items[n] 
          const bought = run(source)
          return bought ? `bought ${name}` : `could not buy ${name}`
        })
      if(!things.length){
        return reply(`nothing was bought`)
      }
      return reply(`<@${source.id}> `+things.join(`, `)) 
    }
  },
  use:{
    allow:()=>true,
    help:()=>`\`use (item:lootbox|splash|pause|joker)\`. Uses an item`,
    run:({ reply, source, args:[item] })=> {
      if(item=='lootbox'){
        if(!source.inventory.lootbox){
          return reply(`You don't have a lootbox to open. Try when you have one`)
        }
        source.inventory.lootbox-=1
        const gift = get_random_array_item(lootbox_gifts)
        const reply_later = make_reply_later(reply)
        reply(`opening loobox! 4 seconds to go`)
        reply_later(`3 seconds to go...`,1000)
        reply_later(`... 2 seconds to gooo...`,2000)
        reply_later(`... 1 SECOND TO GOOOO`,3000)
        setTimeout(()=>{
          if(!(gift in source.inventory)){
            source.inventory[gift]=0
          }
          source.inventory[gift]+=1
        },4000)
        reply_later(`<@${source.id}> got a ${gift.toUpperCase()}!`,4000)          
        return;
      }
      if(item==='splash'){
        if(!source.inventory.splash){
          return reply(`You don't have a splash point to use?!`)
        }
        source.inventory.splash-=1
        return reply(`\`splash--\`.\nnot implemented yet :(`)
        // TODO: IMPLEMENT
      }
      if(item==='pause'){
        if(!source.inventory.pause){
          return reply(`You don't have a pause point. Get back to work!`)
        }
        source.inventory.pause-=1
        reply(`\`pause--\`.\nSure! Take a break. You have one hour`)
        const reply_later = make_reply_later(reply)
        reply_later(`<@${source.id}> your time is up!`,1000*60*60)
      }
      if(item==='joker'){
        if(!source.inventory.joker){
          return reply(`You don't have a joker.`)
        }
        source.inventory.joker-=1
        return reply(`\`joker--\`. \n<@${mentor_role_id}>!!! Please help <@${source.id}>!`)
      }
    }
  },
  summary:{
    allow:()=>true,
    help:()=>`Gives a summary of the whole cohort's performance`,
    run:({ reply, args })=> {
      summary().then(reply)
    }
  },
  todo:{
    allow:()=>true,
    help:()=>`\`todo list, todo list-done, todo <text>, todo do <id>, todo undo <id>\` Manages todos`,
    run:({ reply, source, args, mentions })=> {
      const action = !args.length ? 'list' : args[0]
      if(action=='list'){
        const targets = mentions.length ? mentions : [source]
        const text = targets.map( ({id,todos}) => `<@${id}> tasks: \n`+todos.map(({text},id) => `\`${id}\` - ${text}`).join(`\n`)).join(`\n----------------`)
        return reply(text)
      }
      if(action=='list-done'){
        const targets = mentions.length ? mentions : [source]
        const text = targets.map( ({id,done}) => `<@${id}> done tasks: \n`+done.map(({text},id) => `\`${id}\` - ${text}`).join(`\n`)).join(`\n----------------`)
        return reply(text)
      }
      if(action=='delete'){
        const nums = args.slice(1).map(num => {
          if(source.todos[num]){
            source.todos[num] = false
            return `${num}`
          }
        }).join(`, `)
        source.todos = source.todos.filter(Boolean)
        return reply(`deleted ${nums}`)
      }
      if(action=='do'){
        const nums = args.slice(1).map(num => {
          if(source.todos[num]){
            const old = source.todos[num]
            source.todos[num] = false
            source.done.push(old)
            return `${num}`
          }
        }).join(`, `)
        source.todos = source.todos.filter(Boolean)
        return reply(`set as done: ${nums}`)
      }
      if(action=='undo'){
        const nums = args.slice(1).map(num => {
          if(source.done[num]){
            const old = source.done[num]
            source.done[num] = false
            source.todos.push(old)
            return `${num}`
          }
        }).join(`, `)
        source.done = source.done.filter(Boolean)
        return reply(`set as not done: ${nums}`)
      }
      const targets = mentions.length ? mentions : [source]
      const text = (action == 'add' ? args.slice(1) : args).join(' ')
      targets.forEach(u=>u.todos.push({text}))
      reply(`added task \`${text}\``)
    }
  },
  remind:{
    allow:()=>true,
    help:()=>`Reminds me later (not implemented yet)`,
    run:({ reply, source, args:[ timeStr, unit, ...rest ], mentions })=> {
      const stopArg = timeStr === 'stop'
      if(stopArg){
        const id = parseInt(unit)
        const timer = timers[id]
        if(isNaN(id)){
          return reply(`invalid id:${id}`)
        }
        const text = timer.text
        clearTimeout(timer)
        return reply(`ok, removed this reminder ${text}`)
      }
      const time = parseInt(timeStr)
      if(isNaN(time)){
        return reply(`nope, not a time`)
      }
      if(!/^m|h|s$/.test(unit)){
        return reply(`nope, not a time unit I recognize`)
      }
      const factor = (unit==='h' ? 60*60 : (unit==='m'? 60 : 1 ))*1000
      const timeOut = time * factor
      const text = `Time's out! ${rest.join(' ')}`
      const sayText = () => reply(text)
      const timer = setTimeout(sayText,timeOut)
      timer.text = text
      const id = timers.push(timer) - 1
      const answer = `Ok, I will remind you of this in ${timeOut}ms (${id})`
      return reply(answer)
    }
  },
  convert:{
    allow:()=>true,
    help:()=>`\`convert (x:num)(unit:string) (unit2:string)\`.Converts anything to anything (not implemented yet)`,
    run:({ reply, args })=> {
      //TODO: IMPLEMENT
    }
  },
  meme:{
    allow:()=>true,
    help:()=>`show a meme`,
    run:({ reply, args })=> {
      const {url,imageHeight:height,imageWidth:width,name:title} = get_random_array_item(require('./glitch-images'))
      reply({
        embed:{
          title,
          url,
          image:{
            url,
            width,
            height
          }
        }
      })
    }
  }
}

const timers = []

const get_users_by_rank = (users) => 
  Promise.all(Object.keys(users).map(get_user_by_id))
    .then(users => 
       users
          .sort( ( { inventory:b }, { inventory:a }) => (a.gold+(a.rp*10)) - (b.gold+(b.rp*10)) )
          .filter(({username})=>username!=='Xananax')
    )
    .catch(err=>{throw err})


const summary = () => {
  const sum = {gold:0, rp:0}
  return get_users_by_rank(users).then( users => {
    const users_by_rating = users.map(({id,inventory:{gold,rp}},rank)=>{
      sum.gold+=gold
      sum.rp+=rp
      return `\`${makeTwoDigits(rank+1)}\` | <@${id}> | gold:\`${makeThreeDigits(gold)}\`, rp:\`${makeThreeDigits(rp)}\``
    }).join(`\n`)
    const message = `
      -----------
      !!!TOTAL!!!
      -----------

      Total Cohort Gold: ${sum.gold}
      Total Cohort RP: ${sum.rp}
      ${users_by_rating}
      `;
    return message
  })
  .catch(err=>`error: ${err ? err.message : '?'}`)
}

const summary_html = () => {
  const sum = {gold:0, rp:0}
  return get_users_by_rank(users).then( users => {
    const rows = users.map(({username,inventory:{gold,rp}},rank)=>{
      sum.gold+=gold
      sum.rp+=rp
      return `<tr><td>${makeTwoDigits(rank+1)}</td><td>${username}</td><td>${makeThreeDigits(gold)}</td><td>${makeThreeDigits(rp)}</td></tr>`
    }).join(`\n`)+`<tr><td></td><td>total</td><td>${sum.gold}</td><td>${sum.rp}</td></tr>`;
    const table = `<table><tr><td>rank</td><td>name</td><td>gold</td><td>rp</td></tr>${rows}</table>`
    return table
  })
  .catch(err=>`error: ${err ? err.message : '?'}`)
}


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
  return reply(`could not find your command.${proposal}`)
}

const Z$ = String.fromCharCode(8203) // zero width character

const clean = text => {
  if( typeof(text) === "string" ){
    return text.replace(/`/g, "`" + Z$).replace(/@/g, "@" + Z$ )
  }
  return text;
}

const commands_list = Object.keys(commands)
const levenshtein = require('fast-levenshtein');

const find_close_sounding_command = (attempt, level = 1) => commands_list.filter(command => levenshtein.get(attempt, command) <= level )

module.exports = { checkMessage, log }