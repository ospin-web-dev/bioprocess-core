const Joi = require('joi')
const baseSchema = require('../baseSchema')

module.exports = () => Joi.object({
  srcId: baseSchema.extract('id'),
  destId: baseSchema.extract('id'),
})
