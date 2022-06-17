const createCollectionGetters = require('../compositions/createCollectionGetters')

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

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
}
