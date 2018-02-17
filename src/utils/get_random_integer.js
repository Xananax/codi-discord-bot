/**
 * Returns a random integer
**/
const get_random_int = (max, min=0) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = { get_random_int }