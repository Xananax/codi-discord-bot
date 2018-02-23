const { pad_two_digits, pad_three_digits } = require('../utils/pad_string')

const unit_change_summary = ( unit ) => ( user ) => `<@${user.id}> has \`${user.inventory[unit]}\` ${unit}`

const gotten_gift = ( gift ) => ( user ) => `<@${user.id}> got a ${gift.toUpperCase()}!`

const print_inventory = ({id,inventory:p}) => `<@${id}>'s inventory:\n`+Object.keys(p).map(k=>`\t${k}:${p[k]}\n`).join(``)

const user_value = ( { id, inventory: { gold, rp } }, rank ) =>  `\`${pad_two_digits(rank+1)}\` | <@${id}> | gold:\`${pad_three_digits(gold)}\`, rp:\`${pad_three_digits(rp)}\``

const item_bought = ( name, bought ) => bought ? `bought ${name}` : `could not buy ${name}`

const items_bought = ( source, things ) => `<@${source.id}> `+things.map(([name,bought])=>item_bought(name,bought)).join(`, `)

const nothing_bought = () => `nothing was bought`


const summary =  ( users_by_rank ) => {
  const sum = {gold:0, rp:0}
  const users_by_rating = users_by_rank.map( 
    ( user, rank ) => {
      sum.gold+=user.inventory.gold
      sum.rp+=user.inventory.rp
      return user_value( user, rank )
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
  unit_change_summary,
  gotten_gift,
  print_inventory,
  user_value,
  item_bought,
  items_bought,
  summary,
  nothing_bought
}