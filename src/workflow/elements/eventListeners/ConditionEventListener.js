const Joi = require('joi')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')
const Condition = require('../../../conditions/Condition')

/**
  * @function getAll
  * @memberof Workflow.ConditionEventListener
  * @arg {Object} workflow
  * @desc returns all event listeners of type CONDITION
  */

/**
  * @function add
  * @memberof Workflow.ConditionEventListener
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.phaseId=null - the phase Id the event listener is associated with
  * @arg {Object} initialData.condition={} - condition
  * @desc adds a new CONDITION event listener to the workflow
  */

/**
  * @function update
  * @memberof Workflow.ConditionEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.phaseId=null - the phase Id the event listener is associated with
  * @arg {Object} updateData.condition={} - condition
  * @desc updates an CONDITION event listener in the workflow
  */

/**
  * @function remove
  * @memberof Workflow.ConditionEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an CONDITION event listener from the workflow
  */

const typeSpecificSchema = (
  Joi.object({
    condition: Condition.SCHEMA,
  })
)

module.exports = createDefaultEventListenerInterface(TYPES.CONDITION, typeSpecificSchema)
