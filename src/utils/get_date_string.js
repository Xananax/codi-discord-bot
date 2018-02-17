const { pad_two_digits } = require('./pad_string')
const get_date_arr = (date = new Date()) => [ 
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
  date.getSeconds(),
]

const get_date_string = (date = new Date()) => 
  get_date_arr(date).map(pad_two_digits).join('-')

module.exports = {
  get_date_arr,
  get_date_string
}