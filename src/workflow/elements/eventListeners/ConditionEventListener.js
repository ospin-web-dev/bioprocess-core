const Joi = require('joi')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')
const Condition = require('../../../conditions/Condition')

const TYPE = TYPES.CONDITION

const typeSpecificSchema = (
  Joi.object({
    condition: Condition.SCHEMA.default(),
  })
)

module.exports = createDefaultEventListenerInterface(TYPE, typeSpecificSchema)
