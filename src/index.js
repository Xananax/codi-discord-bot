const token = process.env.DISCORD_BOT_TOKEN
const Eris = require('eris');
const bot = new Eris(token);
const { checkMessage, log } = require('./bot')

/**/
const onMessage = checkMessage(bot)
//console.log(require('./glitch-images'))

bot.on('ready', log('discord connected!'));
bot.on('messageCreate', onMessage); 
//bot.connect();
/**/