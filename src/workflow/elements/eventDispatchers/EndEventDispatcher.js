const createCommonEventDispatcherSchema = require('./createCommonEventDispatcherSchema')
const createElementSchema = require('../createElementSchema')
const addElement = require('../functions/addElement')
const removeElement = require('../functions/removeElement')
const getAllElementsByType = require('../functions/getAllElementsByType')
const { COLLECTION_NAME, ELEMENT_TYPE, TYPES } = require('./EventDispatchers')
const NoEndEventDispatcherError = require('../../errors/NoEndEventDispatcherError')

const TYPE = TYPES.END

const SCHEMA = createElementSchema(ELEMENT_TYPE)
  .concat(createCommonEventDispatcherSchema(TYPE))

/**
  * @function getAll
  * @memberof Workflow.EndEventDispatcher
  * @arg {Object} workflow
  * @desc returns all event dispatchers of type END
  */

const getAll = wf => getAllElementsByType(wf, COLLECTION_NAME, TYPE)

/**
  * @function add
  * @memberof Workflow.EndEventDispatcher
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new END event dispatcher to the workflow
  */

const add = (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data)

const isLastEndEventDispatcher = wf => {
  const dispatchers = getAll(wf)
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
  return removeElement(wf, COLLECTION_NAME, eventDispatcherId)
}

module.exports = {
  SCHEMA,
  TYPE,
  getAll,
  add,
  remove,
}
