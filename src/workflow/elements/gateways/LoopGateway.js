const Joi = require('joi')
const baseSchema = require('../baseSchema')
const { TYPES, ELEMENT_TYPE } = require('./Gateways')

const TYPE = TYPES.LOOP

const SCHEMA = (
  baseSchema.concat(Joi.object({
    elementType: Joi.string().valid(ELEMENT_TYPE).default(ELEMENT_TYPE),
    loopbackFlowId: baseSchema.extract('id').optional().allow(null).default(null),
    maxIterations: Joi.number().integer().strict().default(1),
    type: Joi.string().allow(TYPE).default(TYPE),
  }))
)

const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPE, SCHEMA)
