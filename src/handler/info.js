module.exports = {
  allow:()=>true,
  run: ( { reply, ...rest } ) => {
    const response = JSON.stringify(rest,null,2)
    reply("```json\n"+response+"\n```")
  }
}