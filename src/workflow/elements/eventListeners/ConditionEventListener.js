const Joi = require('joi')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')
const Condition = require('../../../conditions/Condition')

const typeSpecificSchema = (
  Joi.object({
    condition: Condition.SCHEMA.default(),
  })
)

module.exports = createDefaultEventListenerInterface(TYPES.CONDITION, typeSpecificSchema)
