const require_all = require('../utils/require_all')
const handlers = require_all(__dirname,__dirname+'/handler.js')

module.exports = {
  allow:()=>true,
  help:()=>`\`help [command_name:string]\`. Shows this help message`,
  run:( { reply, args:[currentCommand] } ) => {
    if(currentCommand){
      if(!(currentCommand in commands)){
        return reply(`the command \`${currentCommand}\` does not exist.`)
      }
      return reply(`\`${!command_character}\`:${commands[currentCommand].help()}`)
    }
    const commands_str = commands_list.map(c => ` - \`${command_character}${c}\`:${commands[c].help()}`).join(`\n`)
    reply(`Commands: ${commands_list.join(', ')}\n${commands_str}\n\n ranking at https://codi-discord-bot.glitch.me \n bot code available at: https://glitch.com/edit/#!/join/ba51d9ac-df6b-4b9a-8b80-ff8129719412`)
  }
}