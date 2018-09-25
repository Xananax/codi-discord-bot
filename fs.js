const fs = require('fs')

/**
 * Adds characters in the beginning of a string.
 * for example, pad('Z')(4)('a') would yield: 'ZZZa'
**/
const padString = ( padString ) => ( length ) => ( str ) => {
  str+=''
  while (str.length < length){
    str = padString + str;
  }
  return str;
}

const padZeros = padString('0')
const pad2Digits = padZeros(2)

const getDateArr = (date = new Date()) => [ 
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
  date.getSeconds(),
]

const getDateStr = (date = new Date()) => 
  getDateArr(date).map(pad2Digits).join('-')

module.exports = ( dir='./', filename='database.json' ) => {
  
  const getPath = () => `${dir}/${filename}`

  const getPathBackup = () => `${dir}${getDateStr()}-${filename}`
  
  const load = ( def = {} ) => {
    
    try{
      const str = fs.readFileSync(getPath(), { encoding:'utf8' })
      const data = JSON.parse(str)
      return data
    }catch(e){
      write(getPath)(def)
      return def
    }
  }
  
  const write = get_dir => data => {
    if(!data){ return }
    const dir = get_dir()
    const str = JSON.stringify(data,null,2)
    fs.writeFileSync(dir, str, { encoding:'utf8' })
    return dir
  }
  
  const save = write(getPath)

  const backup = write(getPathBackup)

  const saveAndBackup = (data) => save(data) && backup(data)

  return {
    load,
    save,
    backup,
    saveAndBackup
  }
}

