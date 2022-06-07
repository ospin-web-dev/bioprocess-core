const Joi = require('joi')
const Element = require('../Element')

class Gateway extends Element {

  static get ELEMENT_TYPE() {
    return 'GATEWAY'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      elementType: Joi.string().valid(Gateway.ELEMENT_TYPE).default(Gateway.ELEMENT_TYPE),
    }))
  }

}

module.exports = Gateway
