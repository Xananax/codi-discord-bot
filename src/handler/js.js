const safeEval = require('notevil')

module.exports = {
  allow:()=>true,
  help:()=>`Runs javascript`,
  run:({ reply, args })=> {
    const strings = []
    const context = { log: (...what) => strings.push(what.join(' ')) }
    try{
      const ret = safeEval(args.join(' '),context);
      const result = JSON.stringify({result:ret},null,2)
      const boxed = "```js\n"+result.replace(/`/g,'\`')+(strings.length ? '\nlog:\n'+strings.join('\n') : '')+"\n```\n"
      reply(boxed)
    }catch(e){
      reply('```js\n'+e.message+'\n```\n')
    }
  }
}