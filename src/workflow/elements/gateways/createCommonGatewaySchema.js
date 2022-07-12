const Joi = require('joi')

module.exports = type => (
  Joi.object({
    type: Joi.string().allow(type).default(type),
  })
)
