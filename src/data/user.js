const { chain } = require('../utils/chain')
const { merge_arrays:merge } = require('../utils/merge_arrays')
const { get_lootbox_gift }  = require('./lootbox')
const { gotten_gift, unit_change_summary, print_inventory, user_value } = require('./strings')

const get_units_defaults = () => ({
  gold:0, 
  bonus:0,
  splash:0,
  rp:20,
  pause:0,
  joker:0,
  lootbox:1
})

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

const get_or_create_user = (user) => {
  if(!users[user.id]){
    users[user.id] = create_user(user)
  }
  return Ok(users[user.id])
}

const get_or_create_multiple_users = users => users.map(get_or_create_user).filter(isOk)

const get_user_by_id = (id) => {
  if(!users[id]){
    return No(`user ${id} does not exist`)
  }
  return Ok(users[id])
}

const clean_user = chain(
  get_user_by_id,
  remove_if_no,
  (thing) => isNo(thing) ? null : thing,
  ( thing ) => thing && thing.value(),
  ( thing ) => thing && thing.username !== 'Xananax'
)

const compare_gold = ( { inventory:b }, { inventory:a }) => 
  ( a.gold + ( a.rp * 10 ) ) - ( b.gold + ( b.rp * 10 ) )

const get_users_by_rank = (users) => 
  Object.keys(users)
    .map(clean_user)
    .filter(Boolean)
    .sort(compare_gold)


module.exports = {
  get_or_create_multiple_users,
  get_or_create_user,
  print_inventory,
  shop_items,
  get_users_by_rank
}
