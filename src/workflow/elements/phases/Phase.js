const Joi = require('joi')
const Element = require('../Element')
const Command = require('./commands/Command')

class Phase extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      commands: Joi.array().items(Command.SCHEMA).default([]),
    }))
  }

}

module.exports = Phase
