const Joi = require('joi')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const typeSpecificSchema = Joi.object({
  durationInMS: Joi.number().integer().strict().min(0)
    .default(0),
})

module.exports = createDefaultEventListenerInterface(TYPES.TIMER, typeSpecificSchema)
