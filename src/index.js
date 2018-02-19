const { log } = require('./utils/log')
require('dotenv').config()
const buildBot = require('./bot')

const bot = new (require('eris'))(process.env.DISCORD_BOT_TOKEN)
require('./server')(process.env.PORT || 3000)

bot.on('ready', log('discord connected!'))
bot.on('messageCreate', buildBot(bot)) 
bot.connect()