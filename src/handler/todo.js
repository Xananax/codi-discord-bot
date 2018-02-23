module.exports = {
  allow:()=>true,
  help:()=>`\`todo list, todo list-done, todo <text>, todo do <id>, todo undo <id>\` Manages todos`,
  run:({ reply, source, args, mentions })=> {
    const action = !args.length ? 'list' : args[0]
    if(action=='list'){
      const targets = mentions.length ? mentions : [source]
      const text = targets.map( ({id,todos}) => `<@${id}> tasks: \n`+todos.map(({text},id) => `\`${id}\` - ${text}`).join(`\n`)).join(`\n----------------`)
      return reply(text)
    }
    if(action=='list-done'){
      const targets = mentions.length ? mentions : [source]
      const text = targets.map( ({id,done}) => `<@${id}> done tasks: \n`+done.map(({text},id) => `\`${id}\` - ${text}`).join(`\n`)).join(`\n----------------`)
      return reply(text)
    }
    if(action=='delete'){
      const nums = args.slice(1).map(num => {
        if(source.todos[num]){
          source.todos[num] = false
          return `${num}`
        }
      }).join(`, `)
      source.todos = source.todos.filter(Boolean)
      return reply(`deleted ${nums}`)
    }
    if(action=='do'){
      const nums = args.slice(1).map(num => {
        if(source.todos[num]){
          const old = source.todos[num]
          source.todos[num] = false
          source.done.push(old)
          return `${num}`
        }
      }).join(`, `)
      source.todos = source.todos.filter(Boolean)
      return reply(`set as done: ${nums}`)
    }
    if(action=='undo'){
      const nums = args.slice(1).map(num => {
        if(source.done[num]){
          const old = source.done[num]
          source.done[num] = false
          source.todos.push(old)
          return `${num}`
        }
      }).join(`, `)
      source.done = source.done.filter(Boolean)
      return reply(`set as not done: ${nums}`)
    }
    const targets = mentions.length ? mentions : [source]
    const text = (action == 'add' ? args.slice(1) : args).join(' ')
    targets.forEach(u=>u.todos.push({text}))
    reply(`added task \`${text}\``)
  }
}