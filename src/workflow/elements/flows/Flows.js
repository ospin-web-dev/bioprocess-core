const createElementSchema = require('../createElementSchema')
const createCommonSchema = require('./createCommonFlowSchema')
const addElement = require('../functions/addElement')
const removeElement = require('../functions/removeElement')
const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const ELEMENT_TYPE = 'FLOW'
const COLLECTION_NAME = 'flows'

const common = createCommonCollectionInterface(COLLECTION_NAME)

const SCHEMA = createElementSchema(ELEMENT_TYPE)
  .concat(createCommonSchema())

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  SCHEMA,
  add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
  remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  ...common,
}
