const Joi = require('joi')
const Condition = require('../../conditions/Condition')
const { ELEMENT_BASE_SCHEMA } = require('./Element')

const ELEMENT_TYPE = 'EVENT_LISTENER'
const TYPES = {
  START: 'START',
  CONDITION: 'CONDITION',
  APPROVAL: 'APPROVAL',
  TIMER: 'TIMER',
}

const SHARED_SCHEMA = ELEMENT_BASE_SCHEMA.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).required(),
  phaseId: Joi.string().allow(null).default(null),
  interrupting: Joi.boolean().strict().default(true),
}))

const START_EVENT_LISTENER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.START).required(),
}))

const CONDITION_EVENT_LISTENER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.CONDITION).required(),
  condition: Condition.SCHEMA,
}))

const APPROVAL_EVENT_LISTENER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.APPROVAL).required(),
}))

const TIMER_EVENT_LISTENER_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.TIMER).required(),
  durationInMS: Joi.number().integer().strict().min(0)
    .default(0),
}))

const TYPES_TO_SCHEMA = {
  [TYPES.START]: START_EVENT_LISTENER_SCHEMA,
  [TYPES.CONDITION]: CONDITION_EVENT_LISTENER_SCHEMA,
  [TYPES.APPROVAL]: APPROVAL_EVENT_LISTENER_SCHEMA,
  [TYPES.TIMER]: TIMER_EVENT_LISTENER_SCHEMA,
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
