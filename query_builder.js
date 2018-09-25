const studentsDict = {
483533744473374720:"Dana H. Ghani"
,483885231020048385:"Omar Barakat"
,484101150317084674:"RazanAliHussein"
,483587614331502602:"patty_a_g"
,485774302340186114:"Abdullah_Taweel"
,483546085080694795:"fadi.f"
,483626767912009728:"mariokaram"
,483586684823273502:"Ala'a Jaber"
,484347979260755969:"Mustafa Anas"
,319104397898678273:"Imad"
,483885495395549197:"Adel_saltaji"
,483595098865795082:"AhmadKahale"
,483529331264454657:"Sarkis.K"
,369821182456758272:"yazid"
,483551765229207572:"Mireille"
,96232199577161728:"Philippe M"
,484334504090009612:"Bassell"
,483617873160437761:"HusseinHussein"
,483571415161765894:"Hussein"
}
const students = Object.keys(studentsDict).map(id=>({id,name:studentsDict[id]}))

const actions = [{id:"keys",name:"add/remove keys"}]

const opt = (a,b) => `<option value="${a}">${b}</option>`
const select = (name, items) =>  '<select name="'+name+'">'+opt("",name)+items.map( ({id, name}) => opt(id,name))+'</select>'
const studentsSelect = select('student',students)
const input = (name, type="text", value="") => `<input type="${type}" value="${value}" name="${name}" placeholder="${name}"/>`

const form = (action,title,body) => `
  <form action="${action}">
    <fieldset>
      <legend>${title}</legend>
      ${Array.isArray(body) ? body.join(''): body }
      <input type="submit" value="ok"/>
    </fieldset>
  </form>
`

const html = (title,body) => `
<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>${title} | Codi</title></head>
<body>${Array.isArray(body) ? body.join('') : body }</body>
</html>`

const page = () =>{

  const body = [
    form("keys","Add/Remove Keys",[studentsSelect,input("amount","number"), input("reason")]),
    form("keys","Add/Remove Keys",[studentsSelect,input("amount","number"), input("reason")]),
  ]
  
  return html('keys',body);
}

module.exports = page
