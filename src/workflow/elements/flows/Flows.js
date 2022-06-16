const createElementSchema = require('../createElementSchema')
const createCommonSchema = require('./createCommonFlowSchema')
const createCollectionGetters = require('../compositions/createCollectionGetters')
const addElement = require('../functions/collection/addElement')
const removeElement = require('../functions/collection/removeElement')

const ELEMENT_TYPE = 'FLOW'
const COLLECTION_NAME = 'flows'

const {
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
} = createCollectionGetters(COLLECTION_NAME)

const SCHEMA = createElementSchema(ELEMENT_TYPE)
  .concat(createCommonSchema())

module.exports = {
  ELEMENT_TYPE,
  SCHEMA,
  add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
  remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
}
