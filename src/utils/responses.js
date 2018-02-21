class Response{
  constructor(value){
    this.value = value || ''
  }
}

class ResponseOk extends Response{
  constructor(value){
    super(value)
    this.ok = true
  }
}
class ResponseNo extends Response{
  constructor(value){
    super(value)
    this.no = true
  }
}

const isResponse = (response) => response && (response instanceof Response)
const isOk = (response) => response && response.ok
const isNo = (response) => response && response.no

const extractValue = (value) => {
  if(value && ('value' in value) || isResponse(value)){
    return value.value
  }
  return value
}

const Ok = (value) => new ResponseOk(extractValue(value))
const No = (value) => new ResponseNo(extractValue(value))

module.exports = {
  Ok, No, isResponse, isOk, isNo
}