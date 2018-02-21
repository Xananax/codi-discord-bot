class Response{
  constructor(value){
    this._value = value || null
    this._isResponse = true
  }
  valueOf(){
    return this._value
  }
  toString(){
    return this._value ? this._value+'' : ''
  }
  value(){
    return this._value
  }
  toJSON(){
    return this._value
  }
  [Symbol.toPrimitive](hint){
    if (hint == 'number') {
      const n = parseFloat(this._value + 0)
      return (isNaN(n) ? 0 : n)
    }
    if( hint == 'string'){
      return this._value + ''
    }
    return this.ok ? true : false
  }
}

class ResponseOk extends Response{
  constructor(value){
    super(value)
    this.no = false
    this.ok = true
  }
}
class ResponseNo extends Response{
  constructor(value){
    super(value)
    this.ok = false
    this.no = true.value()
  }
  value(){
    return null
  }
  message(){
    return this._value
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