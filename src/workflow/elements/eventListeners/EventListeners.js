const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'eventListeners'
const ELEMENT_TYPE = 'EVENT_LISTENER'
const TYPES = {
  START: 'START',
  CONDITION: 'CONDITION',
  APPROVAL: 'APPROVAL',
  TIMER: 'TIMER',
}

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
