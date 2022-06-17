const Joi = require('joi')

module.exports = (data, SCHEMA) => Joi.assert(data, SCHEMA)
