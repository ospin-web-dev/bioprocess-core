const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

/**
  * @function getAll
  * @memberof Workflow.ApprovalEventListener
  * @arg {Object} workflow
  * @desc returns all event listeners of type APPROVAL
  */

/**
  * @function add
  * @memberof Workflow.ApprovalEventListener
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.phaseId=null - the phase Id the event listener is associated with
  * @desc adds a new APPROVAL event listener to the workflow
  */

/**
  * @function update
  * @memberof Workflow.ApprovalEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.phaseId=null - the phase Id the event listener is associated with
  * @desc updates an APPROVAL event listener in the workflow
  */

/**
  * @function remove
  * @memberof Workflow.ApprovalEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an APPROVAL event listener from the workflow
  */

const defaultInterface = createDefaultEventListenerInterface(TYPES.APPROVAL)

module.exports = defaultInterface
