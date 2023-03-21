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
  * @arg {string|null} initialData.trueFlowId - id of the flow that is triggered when the condition is true
  * @arg {string|null} initialData.falseFlowId - id of the flow what is triggered when the condition is false
  * @arg {object} initialData.condition={} - the condition to be evaluated
  * @desc adds a new conditional gateway to the workflow
  */

/**
  * @function update
  * @memberof Workflow.ConditionalGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.trueFlowId - id of the flow that is triggered when the condition is true
  * @arg {string|null} updateData.falseFlowId - id of the flow what is triggered when the condition is false
  * @arg {object} updateData.condition - the condition to be evaluated
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
