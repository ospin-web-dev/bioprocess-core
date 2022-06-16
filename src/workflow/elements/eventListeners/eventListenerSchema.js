const Joi = require('joi')
const { ELEMENT_TYPE } = require('./EventListeners')
const baseSchema = require('../baseSchema')

module.exports = baseSchema.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).default(ELEMENT_TYPE),
  interrupting: Joi.boolean().default(true),
  phaseId: baseSchema.extract('id').optional().allow(null).default(null),
}))
