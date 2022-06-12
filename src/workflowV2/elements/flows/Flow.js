const Joi = require('joi')
const Element = require('../Element')

class Flow extends Element {

  static get ELEMENT_TYPE() {
    return 'FLOW'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      srcId: super.SCHEMA.extract('id'),
      destId: super.SCHEMA.extract('id'),
      elementType: Joi.string().valid(Flow.ELEMENT_TYPE).default(Flow.ELEMENT_TYPE),
    }))
  }

}

module.exports = Flow
