const Joi = require('joi')
const baseSchema = require('../baseSchema')
const { TYPES } = require('./Gateways')

const SCHEMA = Joi.object({
  loopbackFlowId: baseSchema.extract('id').optional().allow(null).default(null),
  maxIterations: Joi.number().integer().strict().min(1)
    .default(1),
})

const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPES.LOOP, SCHEMA)
