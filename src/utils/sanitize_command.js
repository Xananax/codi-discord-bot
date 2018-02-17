const sanitize_command = ( str ) => (
  str
  .replace(/^\/*|\/*$/g,'') //remove starting and ending slash
  .trim() //remove starting and ending space
  .replace(/^!(.*?)\s|\n/,'!$1 ')
  .replace(/^!/,'') // replace starting "!"
  .replace(/<.*?>/g,'') //replace mentions
  .replace(/(\s)+/g,'$1') // replace double spaces with single spaces
  .replace(/^todo:?\s?/,'todo ')
  .trim() // remove starting and ending space again
)

module.exports = { sanitize_command }