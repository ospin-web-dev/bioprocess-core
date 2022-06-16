const Joi = require('joi')
const eventListenerSchema = require('./eventListenerSchema')
const {
  TYPES,
} = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')
const Condition = require('../../../conditions/Condition')

const TYPE = TYPES.CONDITION

const SCHEMA = (
  eventListenerSchema.concat(Joi.object({
    condition: Condition.SCHEMA.default(),
    type: Joi.string().allow(TYPE).default(TYPE),
  }))
)

module.exports = createDefaultEventListenerInterface(TYPE, SCHEMA)
