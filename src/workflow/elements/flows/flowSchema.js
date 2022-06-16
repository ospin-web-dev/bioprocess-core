const Joi = require('joi')
const { ELEMENT_TYPE } = require('./createFlowsInterface')
const baseSchema = require('../baseSchema')

module.exports = baseSchema.concat(Joi.object({
  srcId: baseSchema.extract('id'),
  destId: baseSchema.extract('id'),
  elementType: Joi.string().valid(ELEMENT_TYPE).default(ELEMENT_TYPE),
}))
