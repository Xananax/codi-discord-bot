const { get_inventory } = require('../data/user')

module.exports = {
  allow:()=>true,
  help:()=>`\`inventory [...@user]\`. Shows your inventory`,
  run:({ source, mentions, reply })=> reply([source, ...mentions].map(get_inventory).join(``)).join(`\n-------\n`))
}