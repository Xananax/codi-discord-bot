const use_lootbox = ({ reply, reply_later, source }) => {
  if(!source.inventory.lootbox){
    return reply(`You don't have a lootbox to open. Try when you have one`)
  }
  source.inventory.lootbox-=1
  const gift = get_lootbox_gift()
  reply(`opening loobox! 4 seconds to go`)
  reply_later(`3 seconds to go...`,1000)
  reply_later(`... 2 seconds to gooo...`,2000)
  reply_later(`... 1 SECOND TO GOOOO`,3000)
  setTimeout(()=>{
    if(!(gift in source.inventory)){
      source.inventory[gift]=0
    }
    source.inventory[gift]+=1
  },4000)
  reply_later(gotten_gift(gift)(source),4000)
}

const use_splash = ({ reply, reply_later, source }) => {
  if(!source.inventory.splash){
    return reply(`You don't have a splash point to use?!`)
  }
  source.inventory.splash-=1
  return reply(`\`splash--\`.\nnot implemented yet :(`)
}

const use_pause = ({ reply, reply_later, source }) => {
  if(!source.inventory.pause){
    return reply(`You don't have a pause point. Get back to work!`)
  }
  source.inventory.pause-=1
  reply(`\`pause--\`.\nSure! Take a break. You have one hour`)
  const reply_later = make_reply_later(reply)
  reply_later(`<@${source.id}> your time is up!`,1000*60*60)
}

const use_joker = ({ reply, reply_later, source }) => {
  if(!source.inventory.joker){
    return reply(`You don't have a joker.`)
  }
  source.inventory.joker-=1
  return reply(`\`joker--\`. \n<@${mentor_role_id}>!!! Please help <@${source.id}>!`)
}

const use = ({ args:[item], ...props }) => {
  if(item=='lootbox'){
    return use_lootbox(props)
  }
  if(item==='splash'){
    return use_splash(props)
  }
  if(item==='pause'){
    return use_pause(props)
  }
  if(item==='joker'){
    return use_joker(props)
  }
}

module.exports = { use, use_joker, use_lootbox, use_pause, use_splash }