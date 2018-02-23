const { Ok, No, isOk, isNo } = require('../utils/responses')
const { chain } = require('../utils/chain')
const { pad_two_digits, pad_three_digits } = require('../utils/pad_string')
const { merge_arrays:merge } = require('../utils/merge_arrays')
const { store_config: store_lootbox, get_lootbox_gift }  = require('./lootbox')

const get_units_defaults = () => ({
  gold:0, 
  bonus:0,
  splash:0,
  rp:20,
  pause:0,
  joker:0,
  lootbox:1
})

const shop_items = [
  store_lootbox
]

const unit_change_summary = (unit) => (user) => `<@${user.id}> has \`${user.inventory[unit]}\` ${unit}`

const create_user = ( { member:{id,nick,roles,user:{avatar,bot:is_bot, discriminator,username}} } ) => { 
  //{id,bot,username,discriminator,verified}
  const user = { 
    nick,
    id,
    inventory:get_units_defaults(),
    tasks:{
      todo:[],
      doing:[],
      done:[]
    },
    late:[]
  }
  return user
}

const change_resource = (unit, num) => ( user ) =>{
  user.inventory[unit] = ((unit in user.inventory) ? user.inventory[unit] : 0) + num;
  return user
}

const handle_resources = ({ args, source, mentions }) => {

  const [,numStr, unit] = args.join('').match(/(\d+)\s*?(\w*)/i) || ['','0','gold']
  
  const num = parseInt(numStr)

  if(isNaN(num) || num === 0){
    return No(`${num} is not a valid number`)
  }

  if(!unit){
    return No(`no unit specified`)
  }

  if(!mentions.length){
    return No('no beneficiary specified')
  }
  
  return Ok({num, unit})
}

const exchange_resources = (direction = 1) => ( props ) => {

  const response = handle_resources(props)

  if(isNo(response)){ return response }

  const { num:_num, unit } = response.value()
  const num = _num * direction
  const { mentions } = props
  
  const remove = num * mentions.length      
  const removeUnit = unit
  const addUnit = unit == 'bonus' ? 'gold' : unit

  if(!source.is_mentor){
    
    if(!(removeUnit in source.inventory)){
      return No(`you don't have any ${removeUnit}`)
    }
    
    const pool = source.inventory[removeUnit]
    
    if(pool < remove){
      return No(`You do not have enough ${unit}. You need at least ${remove}, which is ${remove - pool} more`)
    }

    source.inventory[removeUnit] = pool - remove
    
  }
  
  const prefix = direction > 0 ? '> ' : '< '
  const prefix_main = direction > 0 ? '< ' : '> '

  const transform = chain(
    change_resource(addUnit,num),
    unit_change_summary(addUnit),
    (str) => prefix+str
  )

  const summary = mentions.map(transform).join(`\n`)

  const answer = source.is_mentor ? summary : prefix_main + unit_change_summary(removeUnit)(source) + `\n` + summary
  
  return Ok(answer)

}

const give = exchange_resources(1)
const take = exchange_resources(-1)

const buy = ({ source, args })=> {
  const things = args
    .map( n => n-1 )
    .filter( n => !isNaN(n) || n > shop_items.length )
    .map( n => { 
      const {name, run} = shop_items[n] 
      const bought = run(source)
      return bought ? `bought ${name}` : `could not buy ${name}`
    })
  if(!things.length){
    return No(`nothing was bought`)
  }
  return Ok(`<@${source.id}> `+things.join(`, `)) 
}

const use = ({ reply, reply_later, source, args:[item] }) => {
  if(item=='lootbox'){
    if(!source.inventory.lootbox){
      return reply(`You don't have a lootbox to open. Try when you have one`)
    }
    source.inventory.lootbox-=1
    const gift = get_lootbox_gift()
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

const get_inventory = ({id,inventory:p}) => 
  `<@${id}>'s inventory:\n`+Object.keys(p).map(k=>`\t${k}:${p[k]}\n`).join(``)

const get_or_create_user = (user) => {
  if(!users[user.id]){
    users[user.id] = create_user(user)
  }
  return Ok(users[user.id])
}

const get_or_create_multiple_users = users => users.map(get_or_create_user).filter(isOk)

const get_user_by_id = (id) => {
  if(!users[id]){
    return No('user '+id+' does not exist')
  }
  return Ok(users[id])
}

const remove_if_no = (thing) => isNo(thing) ? null : thing

const get_users_by_rank = (users) => 
  Object.keys(users)
    .map(chain(
      get_user_by_id,
      remove_if_no,
      ( thing ) => thing && thing.value(),
      ( thing ) => thing && thing.username !== 'Xananax'
    ))
    .filter(Boolean)
    .sort( ( { inventory:b }, { inventory:a }) => (a.gold+(a.rp*10)) - (b.gold+(b.rp*10)) )

const summary = () => {
  const sum = {gold:0, rp:0}
  const users_by_rating = get_users_by_rank(users)
    .map( ( { id, inventory: { gold, rp } }, rank ) => {
      sum.gold+=gold
      sum.rp+=rp
      return `\`${pad_two_digits(rank+1)}\` | <@${id}> | gold:\`${pad_three_digits(gold)}\`, rp:\`${pad_three_digits(rp)}\``
    })
    .join(`\n`)
  const message = `
-----------
!!!TOTAL!!!
-----------

Total Cohort Gold: ${sum.gold}
Total Cohort RP: ${sum.rp}
${users_by_rating}
`;
  return message
}


module.exports = {
  get_or_create_multiple_users,
  get_or_create_user,
  get_inventory,
  shop_items,
  get_users_by_rank
}
