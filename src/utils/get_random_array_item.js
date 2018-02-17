/**
 * Returns a random element from an array
**/
const get_random_array_item = (arr) => () => arr[get_random_int(arr.length-1)]
