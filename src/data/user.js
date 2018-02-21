const { Ok, No, isOk } = require('../utils/responses')
const get_units_defaults = () => ({
  gold:0, 
  bonus:0,
  splash:0,
  rp:20,
  pause:0,
  joker:0,
  lootbox:1
})

const unit_types = Object.keys(get_units_defaults())

const filledArray = (name,times) => ( new Array(times) ).fill(name)
const merge = (...arrs) => arrs.reduce( ( prev, curr ) => prev.concat(curr) ) 

const lootbox_gifts = merge(
  filledArray( 'joker' , 4 ),
  filledArray( 'pause' , 4 ),
  filledArray( 'rp'    , 8 ),
  filledArray( 'batata', 1 ),
  filledArray( 'rock'  , 1 ),
  filledArray( 'candy' , 1 ),
)

const shop_items = [
  { name:'loot box',
    price:`100 gold`,
    run:( user ) => {
      if( user.inventory.gold < 100 ){ return No('not enough gold') }
      user.inventory.lootbox+=1
      user.inventory.gold-=100
      return Ok('added')
    },
    description:`A box that contains a suprise!`
  }
]

const create_user = ( { member:{id,nick,roles,user:{avatar,bot:is_bot, discriminator,username}} } ) => { 
  //{id,bot,username,discriminator,verified}
  const user = { 
    member:{ nick, roles, avatar, is_bot, discriminator},
    id,
    username,
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


module.exports = {
  get_or_create_multiple_users,
  get_or_create_user
}
