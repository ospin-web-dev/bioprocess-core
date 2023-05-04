const Joi = require('joi')

const { ELEMENT_BASE_SCHEMA } = require('./Element')

const ELEMENT_TYPE = 'FLOW'

const SCHEMA = ELEMENT_BASE_SCHEMA.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).required(),
  srcId: Joi.string().required(null),
  destId: Joi.string().required(),
}))

module.exports = {
  SCHEMA,
  ELEMENT_TYPE,
}
