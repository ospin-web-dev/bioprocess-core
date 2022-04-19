const Joi = require('joi')
const Element = require('../Element')

class Flow extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      srcId: super.SCHEMA.extract('id').allow(null).default(null),
      destId: super.SCHEMA.extract('id').allow(null).default(null),
    }))
  }

}

module.exports = Flow
