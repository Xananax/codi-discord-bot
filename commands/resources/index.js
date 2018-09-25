const { resources, tags } = require("./list")

const findOne = (source, needle) => {
  const r = new RegExp(needle)
  return source.filter(({tags})=>r.test(tags))
}

const find = ( source, needles) => {
  let i = needles.length - 1
  let matches = resources.slice()
  while(i>=0){
    matches = findOne(matches,needles[i--])
  }
  return matches
}

module.exports = {
  help:()=>`Answers "pong"`,
  run:({ ok, no, args })=> {
    if(args[0] === 'tags' || !args[0]){
      return ok({tags})
    }
    const matches = find(args)
    if(!matches.length){
      return no({ error:'nothing found for the combination `'+args.join(',')+'`' })
    }
    return ok({matches:matches.map(({url,desc})=>`- <${url}> → ${desc}\n`).join('')})
  }
}