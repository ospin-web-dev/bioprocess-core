const { TYPES } = require('./EventListeners')
const IncorrectAmountOfStartEventListenersError = require('../../errors/IncorrectAmountOfStartEventListenersError')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

/**
  * @function getAll
  * @memberof Workflow.StartEventListener
  * @arg {Object} workflow
  * @desc returns all event listeners of type START
  */

/**
  * @function add
  * @memberof Workflow.StartEventListener
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string|null} initialData.phaseId=null - the phase Id the event listener is associated with
  * @desc adds a new START event listener to the workflow
  */

/**
  * @function update
  * @memberof Workflow.StartEventListener
  * @arg {Object} workflow
  * @arg {id} id
  * @arg {Object} updateData
  * @arg {string|null} updateData.phaseId=null - the phase Id the event listener is associated with
  * @desc updates an START event listener in the workflow
  */

const defaultInterface = createDefaultEventListenerInterface(TYPES.START)

const add = (wf, data) => {
  const startListeners = defaultInterface.getAll(wf)
  if (startListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()
  return defaultInterface.add(wf, data)
}

module.exports = {
  ...defaultInterface,
  add,
}
