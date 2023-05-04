const Joi = require('joi')

const { ELEMENT_BASE_SCHEMA } = require('./Element')
const { SCHEMA: COMMAND_SCHEMA } = require('./Element')

const ELEMENT_TYPE = 'PHASE'

const SCHEMA = ELEMENT_BASE_SCHEMA.concat(Joi.object({
  elementType: Joi.string.valid(ELEMENT_TYPE).required(),
  commands: Joi.array().items(COMMAND_SCHEMA).default([]),
}))

module.exports = {
  SCHEMA,
  ELEMENT_TYPE,
}
