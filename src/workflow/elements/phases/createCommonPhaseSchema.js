const Joi = require('joi')
const Command = require('./commands/Command')

module.exports = () => Joi.object({
  commands: Joi.array().items(Command.SCHEMA).default([]),
})
