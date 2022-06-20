const Joi = require('joi')
const baseSchema = require('../baseSchema')
const { TYPES } = require('./Gateways')

/**
  * @function getAll
  * @memberof Workflow.LoopGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type LOOP
  */

/**
  * @function add
  * @memberof Workflow.LoopGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.loopbackFlowId=null - the flow Id if the loopback flow
  * @arg {number} initialData.maxIterations=0 - the amount of iterations of the loop
  * @desc adds a new LOOP gateway to the workflow
  */

/**
  * @function update
  * @memberof Workflow.LoopGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.loopbackFlowId=null - the flow Id if the loopback flow
  * @arg {number} updateData.maxIterations=0 - the amount of iterations of the loop
  * @desc updates an LOOP gateway in the workflow
  */

/**
  * @function remove
  * @memberof Workflow.LoopGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an LOOP gateway from the workflow
  */

const SCHEMA = Joi.object({
  loopbackFlowId: baseSchema.extract('id').optional().allow(null).default(null),
  maxIterations: Joi.number().integer().strict().min(1)
    .default(1),
})

const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPES.LOOP, SCHEMA)
