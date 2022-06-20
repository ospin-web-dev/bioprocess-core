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

const getAll = wf => getAllElementsByType(wf, COLLECTION_NAME, TYPE)

const add = (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data)

const isLastEndEventDispatcher = wf => {
  const dispatchers = getAll(wf)
  return dispatchers.length === 1
}

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
