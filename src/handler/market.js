const { shop_items } = require('../data/user')

module.exports = {
  allow:()=>true,
  help:()=>`Tells you what's on offer on the market`,
  run:({ source, mentions, reply })=> reply(`ON THE MARKET TODAY:\n`+shop_items.map(({name,description, price},n)=>` - \`${n+1}\` ${name}: ${description} | [\`${price}\`]`).join(`\n`))
}