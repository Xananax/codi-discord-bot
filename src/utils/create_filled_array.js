const create_filled_array = predicate => times => ( new Array(times) ).fill('').map((_,i)=>predicate(i))

module.exports = create_filled_array