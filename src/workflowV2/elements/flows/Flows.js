const flowSchema = require('../baseSchema')
const createCollectionGetters = require('../compositions/createCollectionGetters')
const addElement = require('../functions/collection/addElement')
const removeElement = require('../functions/collection/removeElement')

const COLLECTION_NAME = 'flows'

const {
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
} = createCollectionGetters(COLLECTION_NAME)

module.exports = {
  SCHEMA: flowSchema,
  add: (wf, data) => addElement(wf, COLLECTION_NAME, flowSchema, data),
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
  remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
}
