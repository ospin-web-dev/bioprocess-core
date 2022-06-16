const Joi = require('joi')
const baseSchema = require('./baseSchema')

module.exports = elementType => baseSchema.concat(Joi.object({
  elementType: Joi.string().valid(elementType).default(elementType),
}))
