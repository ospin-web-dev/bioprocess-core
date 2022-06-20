const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'gateways'
const ELEMENT_TYPE = 'GATEWAY'
const TYPES = {
  AND_MERGE: 'AND_MERGE',
  AND_SPLIT: 'AND_SPLIT',
  LOOP: 'LOOP',
  OR_MERGE: 'OR_MERGE',
}

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
