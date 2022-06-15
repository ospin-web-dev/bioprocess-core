const Joi = require('joi')

module.exports = (data, schema) => (
  Joi.attempt(data, schema)
)
