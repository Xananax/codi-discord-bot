const glitch_assets = '/app/.glitch-assets'
const images = {}
const fs = require('fs')
const data = fs.readFileSync(glitch_assets, 'utf8')
data.split('\n').forEach(line => {
  if ( line.trim() === '' ) {return}
  try {
    const json = JSON.parse(line)
    if ( json.deleted ) {
      delete images[json.uuid]
    }
    else {
      images[json.uuid] = json
    }
  }
  catch(err) {
    console.error(err)
  }
})

const images_arr = Object.keys(images).map(k=>images[k])

module.exports = images_arr
