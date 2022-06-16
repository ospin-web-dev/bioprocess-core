const Joi = require('joi')
const baseSchema = require('../baseSchema')
const { TYPES } = require('./Gateways')

const TYPE = TYPES.LOOP

const SCHEMA = Joi.object({
  loopbackFlowId: baseSchema.extract('id').optional().allow(null).default(null),
  maxIterations: Joi.number().integer().strict().default(1),
})

const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPE, SCHEMA)
