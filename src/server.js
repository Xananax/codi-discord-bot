const http = require('http')
const { parse } = require('url')
const NodeSession = require('node-session');
const { url_decode } = require('./utils/url_decode')
const { sanitize_command } = require('./utils/sanitize_command')
const { parse_command } = require('./utils/parse_command')
const { log } = require('./utils/log')

session = new NodeSession({
  secret: process.env.SALT,
  cookie: 'bot',
})

const split_on_first_occurence = ( str ) => str.split(/\/(.+)/)

const remove_first_slash = ( str ) => str.replace(/^\//,'')

const extract_command = ( str ) => split_on_first_occurence(remove_first_slash(url_decode(str)))

const make_send = ( response ) => ( status = 200 ) => ( text ) => {
  response.writeHead(status, { "Content-Type": "text/plain" })
  response.end(text)
  return true;
}

const start =  ( port = process.env.PORT || 3000 ) => 
  http.createServer(( request, response) => {
    session.startSession( request, response, () => {
      const token = request.session.getToken()
      const { query, pathname } = parse(request.url, true)
      const [ path, text ] = extract_command(pathname)
      const send = make_send(response)
      const ok = send(200)
      const err = send(500)
      if(path == 'bot' && text){
        const source =  { id: token }
        const mentions = query.mentions || []
        const [ command, args ] = parse_command(sanitize_command(text))
        const props = { source, mentions, command, args, text }
        return ok(JSON.stringify({token, query, command,args}))
      }
      err('ERROR')
    })
  })
  .listen( port, ( err ) => err ? log('ERROR')(err) : log('all good')(port) )

module.exports = { start }

start()