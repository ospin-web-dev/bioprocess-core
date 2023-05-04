const Joi = require('joi')
const Condition = require('../../conditions/Condition')
const { ELEMENT_BASE_SCHEMA } = require('./Element')

const ELEMENT_TYPE = 'GATEWAY'

const TYPES = {
  AND: 'AND',
  OR: 'OR',
  CONDITIONAL: 'CONDITIONAL',
}

const SHARED_SCHEMA = ELEMENT_BASE_SCHEMA.concat(Joi.object({
  elementType: Joi.string().valid(ELEMENT_TYPE).required(),
}))

const AND_GATEWAY_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.AND).required(),
}))

const OR_GATEWAY_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.OR).required(),
}))

const CONDITIONAL_GATEWAY_SCHEMA = SHARED_SCHEMA.concat(Joi.object({
  type: Joi.string().valid(TYPES.CONDITIONAL).required(),
  trueFlowId: Joi.string().allow(null).default(null),
  falseFlowId: Joi.string().allow(null).default(null),
  condition: Condition.SCHEMA,
}))

const TYPES_TO_SCHEMA = {
  [TYPES.AND]: AND_GATEWAY_SCHEMA,
  [TYPES.OR]: OR_GATEWAY_SCHEMA,
  [TYPES.CONDITIONAL]: CONDITIONAL_GATEWAY_SCHEMA,
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
