const Joi = require('joi')
const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

/**
  * @function getAll
  * @memberof Workflow.TimerEventListener
  * @arg {Object} workflow
  * @desc returns all event listeners of type TIMER
  */

/**
  * @function add
  * @memberof Workflow.TimerEventListener
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.phaseId=null - the phase Id the event listener is associated with
  * @arg {number} initialData.durationInMS=0 - desired triggering time in milliseconds
  * @desc adds a new TIMER event listener to the workflow
  */

/**
  * @function update
  * @memberof Workflow.TimerEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.phaseId=null - the phase Id the event listener is associated with
  * @arg {number} updateData.durationInMS=0 - desired triggering time in milliseconds
  * @desc updates an TIMER event listener in the workflow
  */

/**
  * @function remove
  * @memberof Workflow.TimerEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an TIMER event listener from the workflow
  */

const typeSpecificSchema = Joi.object({
  durationInMS: Joi.number().integer().strict().min(0)
    .default(0),
})

module.exports = createDefaultEventListenerInterface(TYPES.TIMER, typeSpecificSchema)
