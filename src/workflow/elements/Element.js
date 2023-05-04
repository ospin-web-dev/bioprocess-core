const Joi = require('joi')

const ELEMENT_BASE_SCHEMA = Joi.object({ id: Joi.string().required() })

module.exports = {
  ELEMENT_BASE_SCHEMA,
}
