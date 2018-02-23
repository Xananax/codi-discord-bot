const { Ok, No, isOk, isNo } = require('../utils/responses')
const { unit_change_summary, user_value } = require('./strings')

const change_resource = (unit, num) => ( user ) =>{
  user.inventory[unit] = ((unit in user.inventory) ? user.inventory[unit] : 0) + num;
  return user
}

const exchange_resources = (direction = 1) => ( props ) => {

  const [,numStr, unit] = args.join('').match(/(\d+)\s*?(\w*)/i) || ['','0','gold']
  
  const _num = parseInt(numStr)

  if(isNaN(_num) || _num === 0){
    return No(`${numStr} is not a valid number`)
  }

  if(!unit){
    return No(`no unit specified`)
  }

  if(!mentions.length){
    return No('no beneficiary specified')
  }

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


module.exports = { give, take }