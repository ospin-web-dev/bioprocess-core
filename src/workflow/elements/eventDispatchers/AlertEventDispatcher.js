const createDefaultEventDispatcherInterface = require('./createDefaultEventDispatcherInterface')
const { TYPES } = require('./EventDispatchers')

const TYPE = TYPES.ALERT

const defaultInterface = createDefaultEventDispatcherInterface(TYPE)

/**
  * @function getAll
  * @memberof Workflow.AlertEventDispatcher
  * @arg {Object} workflow
  * @desc returns all event dispatchers of type ALERT
  */

/**
  * @function add
  * @memberof Workflow.AlertEventDispatcher
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new ALERT event dispatcher to the workflow
  */

/**
  * @function remove
  * @memberof Workflow.AlertEventDispatcher
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an ALERT event dispatcher from the workflow
  */

module.exports = defaultInterface
