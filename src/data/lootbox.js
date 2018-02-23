const { get_random_array_item } = require('../utils/get_random_array_item')
const filledArray = (name,times) => ( new Array(times) ).fill(name)

const lootbox_gifts = merge(
  filledArray( 'joker' , 4 ),
  filledArray( 'pause' , 4 ),
  filledArray( 'rp'    , 8 ),
  filledArray( 'batata', 1 ),
  filledArray( 'rock'  , 1 ),
  filledArray( 'candy' , 1 ),
)

const get_lootbox_gift = get_random_array_item(lootbox_gifts)

const store_config ={ 
  name:'loot box',
  price:`100 gold`,
  buy: ( user ) => {
    if( user.inventory.gold < 100 ){ return No('not enough gold') }
    user.inventory.lootbox+=1
    user.inventory.gold-=100
    return Ok('added')
  },
  description:`A box that contains a suprise!`
}


module.exports = {
  store_config,
  lootbox_gifts,
  get_lootbox_gift
}