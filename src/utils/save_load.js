const fs = require('fs')
const { get_date_string } = require('./get_date_string')

module.exports.make_fs = ( dir='./data', filename='database.json' ) => {

  const path = `${dir}/${filename}`

  const get_backup_path = () => `${dir}${get_date_string()}-${filename}`

  const load = () => {
    try{
      const str = fs.readFileSync(path,{encoding:'utf8'})
      const data = JSON.parse(str)
      return data
    }catch(e){
      return {}
    } 
  }
  
  const save = (data) => {
    if(!data){ return }
    const str = JSON.stringify(data,null,2)
    require('fs').writeFileSync(path,str,{encoding:'utf8'})
    return path
  }

  const backup = (data) => {
    const backup_path = get_backup_path()
    require('fs').writeFileSync(backup_path,str,{encoding:'utf8'})
    return backup_path
  }

  const save_and_backup = (data) => save(data) && backup(data)

  const save_every = ( what, seconds=10 ) => setInterval(()=>save_and_backup(what),1000*seconds)

  return {
    load,
    save,
    backup,
    save_and_backup
  }
}

