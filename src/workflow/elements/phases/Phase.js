const Joi = require('joi')
const Element = require('../Element')
const Command = require('./commands/Command')

class Phase extends Element {

  static get ELEMENT_TYPE() {
    return 'PHASE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      commands: Joi.array().items(Command.SCHEMA).default([]),
      elementType: Joi.string().valid(Phase.ELEMENT_TYPE).default(Phase.ELEMENT_TYPE),
    }))
  }

}

module.exports = Phase
