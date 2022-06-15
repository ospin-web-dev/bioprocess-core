const Joi = require('joi')
const eventListenerSchema = require('./eventListenerSchema')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const TYPE = TYPES.TIMER

const SCHEMA = (
  eventListenerSchema.concat(Joi.object({
    durationInMS: Joi.number().integer().strict().min(0)
      .default(0),
    type: Joi.string().allow(TYPE).default(TYPE),
  }))
)

module.exports = createDefaultEventListenerInterface(TYPES.TIMER, SCHEMA)
