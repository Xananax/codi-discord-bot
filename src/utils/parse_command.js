const parse_command = text => {
  const [ _command, ...args] = text.split(' ')
  const command = _command.replace(/\n+/g,'').replace(/\s+/g,'').trim()
  return [command,args]
}

module.exports = { parse_command }