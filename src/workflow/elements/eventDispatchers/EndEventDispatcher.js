const createDefaultEventDispatcherInterface = require('./createDefaultEventDispatcherInterface')
const { TYPES } = require('./EventDispatchers')
const NoEndEventDispatcherError = require('../../errors/NoEndEventDispatcherError')

const TYPE = TYPES.END

const defaultInterface = createDefaultEventDispatcherInterface(TYPE)

/**
  * @function getAll
  * @memberof Workflow.EndEventDispatcher
  * @arg {Object} workflow
  * @desc returns all event dispatchers of type END
  */

/**
  * @function add
  * @memberof Workflow.EndEventDispatcher
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new END event dispatcher to the workflow
  */

const isLastEndEventDispatcher = wf => {
  const dispatchers = defaultInterface.getAll(wf)
  return dispatchers.length === 1
}

/**
  * @function remove
  * @memberof Workflow.EndEventDispatcher
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an END event dispatcher from the workflow
  */

const remove = (wf, eventDispatcherId) => {
  if (isLastEndEventDispatcher(wf)) {
    throw new NoEndEventDispatcherError()
  }
  return defaultInterface.remove(wf, eventDispatcherId)
}

module.exports = {
  ...defaultInterface,
  remove,
}
