const Joi = require('joi')
const { ELEMENT_TYPE } = require('./Gateways')
const baseSchema = require('../baseSchema')

module.exports = baseSchema.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).default(ELEMENT_TYPE),
}))
