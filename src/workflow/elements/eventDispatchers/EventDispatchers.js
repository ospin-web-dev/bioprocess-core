const createCollectionGetters = require('../compositions/createCollectionGetters')
const removeElement = require('../functions/collection/removeElement')
const NoEndEventDispatcherError = require('../../validator/errors/NoEndEventDispatcherError')

const COLLECTION_NAME = 'eventDispatchers'
const ELEMENT_TYPE = 'EVENT_DISPATCHER'
const TYPES = {
  END: 'END',
}

const {
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
} = createCollectionGetters(COLLECTION_NAME)

const isLastEndEventDispatcher = (wf, eventDispatcherId) => {
  const dispatcher = getById(wf, eventDispatcherId)
  if (dispatcher.type === TYPES.END) {
    const allEndEventDispatchers = getManyBy(wf, { type: TYPES.END })
    return allEndEventDispatchers.length === 1
  }
  return false
}

const remove = (wf, eventDispatcherId) => {
  if (isLastEndEventDispatcher(wf, eventDispatcherId)) {
    throw new NoEndEventDispatcherError()
  }
  return removeElement(wf, COLLECTION_NAME, eventDispatcherId)
}

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
  remove,
}
