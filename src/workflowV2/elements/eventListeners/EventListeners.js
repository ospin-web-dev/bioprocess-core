const createCollectionGetters = require('../compositions/createCollectionGetters')
const removeElement = require('../functions/collection/removeElement')
const IncorrectAmountOfStartEventListenersError = require('../../validator/errors/IncorrectAmountOfStartEventListenersError')

const COLLECTION_NAME = 'eventListeners'
const ELEMENT_TYPE = 'EVENT_LISTENER'
const TYPES = {
  START: 'START',
  CONDITION: 'CONDITION',
  APPROVAL: 'APPROVAL',
  TIMER: 'TIMER',
}

const {
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
} = createCollectionGetters(COLLECTION_NAME)

const isStartEventListener = (wf, eventListenerId) => {
  const listener = getById(wf, eventListenerId)
  return listener.type === TYPES.START
}

const remove = (wf, eventListenerId) => {
  if (isStartEventListener(wf, eventListenerId)) {
    throw new IncorrectAmountOfStartEventListenersError()
  }
  return removeElement(wf, COLLECTION_NAME, eventListenerId)
}

module.exports = {
  TYPES,
  COLLECTION_NAME,
  ELEMENT_TYPE,
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
  remove,
}
