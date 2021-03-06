const { log } = require('./log')

const commands = {
  give:{
    allow:()=>true,
    help:()=>`\`give (x:num)(unit:string) (@user) [...@user]\` .Give some resource to someone`,
  },
  take:{
    allow:( msg )=>true, //TODO: make this usable by mods only
    help:()=>`\`take (x:num)(unit:string) (from:@user)\`. Takes from someone. Only usable by mods`,
  },
  buy:{
    allow:()=>true,
    help:()=>`\`buy\ (thing:int)\`. Buys a thing from the market `,
  },
  use:{
    allow:()=>true,
    help:()=>`\`use (item:lootbox|splash|pause|joker)\`. Uses an item`,
  },
  summary:{
    allow:()=>true,
    help:()=>`Gives a summary of the whole cohort's performance`,
    run:({ reply, args })=> {
      summary().then(reply)
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