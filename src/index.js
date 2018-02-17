require('dotenv').config()
const bot = new (require('eris'))(process.env.DISCORD_BOT_TOKEN)
//const { checkMessage, log } = require('./bot')

/**/
//const onMessage = checkMessage(bot)
//console.log(require('./glitch-images'))

//bot.on('ready', log('discord connected!'));
//bot.on('messageCreate', onMessage); 
//bot.connect();
/**/

console.log(process.env.DISCORD_BOT_TOKEN)