const Joi = require('joi')
const baseSchema = require('../baseSchema')

module.exports = type => Joi.object({
  phaseId: baseSchema.extract('id').optional().allow(null).default(null),
  type: Joi.string().allow(type).default(type),
})
