const Joi = require('joi')

module.exports = (data, SCHEMA) => Joi.attempt(data, SCHEMA)
