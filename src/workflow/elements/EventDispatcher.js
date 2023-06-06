const Joi = require('joi')
const { ELEMENT_BASE_SCHEMA } = require('./Element')

const ELEMENT_TYPE = 'EVENT_DISPATCHER'
const TYPES = {
  END: 'END',
  ALERT: 'ALERT',
}

const SHARED_SCHEMA = ELEMENT_BASE_SCHEMA.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).required(),
}))

const END_EVENT_DISPATCHER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.END).required(),
}))

const ALERT_EVENT_DISPATCHER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.ALERT).required(),
}))

const TYPES_TO_SCHEMA = {
  [TYPES.END]: END_EVENT_DISPATCHER_SCHEMA,
  [TYPES.ALERT]: ALERT_EVENT_DISPATCHER_SCHEMA,
}

const SCHEMA = Joi.alternatives().try(
  ...Object.values(TYPES_TO_SCHEMA),
)

module.exports = {
  SCHEMA,
  ELEMENT_TYPE,
  TYPES,
  TYPES_TO_SCHEMA,
}
