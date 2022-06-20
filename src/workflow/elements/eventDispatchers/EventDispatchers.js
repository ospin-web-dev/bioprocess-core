const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'eventDispatchers'
const ELEMENT_TYPE = 'EVENT_DISPATCHER'
const TYPES = { END: 'END' }

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
