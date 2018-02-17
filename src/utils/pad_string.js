/**
 * Adds characters in the beginning of a string.
 * for example, pad('Z')(4)('a') would yield: 'ZZZa'
**/
const pad_string = ( padString ) => ( length ) => ( str ) => {
  str+=''
  while (str.length < length){
    str = padString + str;
  }
  return str;
}

const pad_zeros = pad_string('0')
const pad_two_digits = pad_zeros(2)
const pad_three_digits = pad_zeros(3)

module.exports = {
  pad_string,
  pad_zeros,
  pad_two_digits,
  pad_three_digits
}