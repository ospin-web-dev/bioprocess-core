const Joi = require('joi')
const Element = require('../Element')

class Phase extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      commands: Joi.array().default([]),
    }))
  }

}

module.exports = Phase
