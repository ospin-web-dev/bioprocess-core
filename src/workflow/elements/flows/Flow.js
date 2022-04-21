const Joi = require('joi')
const Element = require('../Element')

class Flow extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      srcId: super.SCHEMA.extract('id'),
      destId: super.SCHEMA.extract('id'),
    }))
  }

}

module.exports = Flow
