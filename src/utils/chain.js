/**
 * 
 * const add = (a) => a+5
 * const mul = (a) => a*2 
 * const addmul = chain(add,mul)
 * const muladd = chain(mul,add)
 * 
 * console.log(addmul(0),'::',muladd(0)) // 10 :: 5
 * @param {Function} fns a series of functions
 */
const chain = (...fns) => (val) => fns.reduce((prev,curr)=>curr(prev),val)

module.exports = { chain }