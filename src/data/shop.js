const { Ok, No, isOk, isNo } = require('../utils/responses')
const { store_config: store_lootbox }  = require('./lootbox')
const { items_bought } = require('./string')

const shop_items = [
  store_lootbox
]

const buy = ({ source, args })=> {
  const things = args
    .map( n => n-1 )
    .filter( n => !isNaN(n) || n > shop_items.length )
    .map( n => { 
      const {name, run} = shop_items[n] 
      const bought = run(source)
      return [ name, bought ] 
    })
  if(!things.length){
    return No(nothing_bought())
  }
  return Ok(items_bought(source,things)) 
}

module.exports = { shop_items, buy }