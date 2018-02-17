const { parse } = require('url')
const http = require('http')
const { url_decode } = require('./utils/url_decode')
const { sanitize_command } = require('./utils/sanitize_command')
const { parse_command } = require('./utils/parse_command')
const { log } = require('./utils/log')

const split_on_first_occurence = ( str ) => str.split(/\/(.+)/)

const remove_first_slash = ( str ) => str.replace(/^\//,'')

const extract_command = ( str ) => split_on_first_occurence(remove_first_slash(url_decode(str)))

const start =  ( port = process.env.PORT || 3000 ) => 
  http.createServer(( request, response) => {
    const { query, pathname } = parse(request.url, true)
    const [ path, rest ] = extract_command(pathname)
    const send = (text, status=200) => {
      response.writeHead(status, {"Content-Type": "text/plain"});
      response.end(text)
    }
    if(path == 'bot' && rest){
      const [ command, args ] = parse_command(sanitize_command(rest))
      send(JSON.stringify({query, command,args}))
      return
    }
    send('ERROR',404)
  })
  .listen( port, ( err ) => err ? log('ERROR')(err) : log('all good')(port) )

module.exports = { start }

start()