const Joi = require('joi')
const baseSchema = require('../baseSchema')
const { TYPES } = require('./Gateways')
const Condition = require('../../../conditions/Condition')

/**
  * @function getAll
  * @memberof Workflow.ConditionalGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type LOOP
  */

/**
  * @function add
  * @memberof Workflow.ConditionalGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.loopbackFlowId=null - the flow Id if the loopback flow
  * @arg {number} initialData.maxIterations=0 - the amount of iterations of the loop
  * @desc adds a new conditional gateway to the workflow
  */

/**
  * @function update
  * @memberof Workflow.ConditionalGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.loopbackFlowId=null - the flow Id if the loopback flow
  * @arg {number} updateData.maxIterations=0 - the amount of iterations of the loop
  * @desc updates an conditional gateway in the workflow
  */

/**
  * @function remove
  * @memberof Workflow.ConditionalGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an conditional gateway from the workflow
  */

const SCHEMA = Joi.object({
  trueFlowId: baseSchema.extract('id').optional().allow(null).default(null),
  falseFlowId: baseSchema.extract('id').optional().allow(null).default(null),
  condition: Condition.SCHEMA,
})

const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPES.CONDITIONAL, SCHEMA)
