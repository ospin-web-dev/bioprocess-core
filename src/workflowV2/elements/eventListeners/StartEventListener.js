const Joi = require('joi')
const eventListenerSchema = require('./eventListenerSchema')
const addElement = require('../functions/collection/addElement')
const updateElement = require('../functions/collection/updateElement')
const getAllElements = require('../functions/collection/typeSpecific/getAllElements')
const {
  TYPES,
  COLLECTION_NAME,
} = require('./EventListeners')
const IncorrectAmountOfStartEventListenersError = require('../../validator/errors/IncorrectAmountOfStartEventListenersError')

const TYPE = TYPES.START

const SCHEMA = (
  eventListenerSchema.concat(Joi.object({
    type: Joi.string().allow(TYPE).default(TYPE),
  }))
)

const getAll = wf => getAllElements(wf, COLLECTION_NAME, TYPE)

const add = (wf, data) => {
  const startListeners = getAll(wf)
  if (startListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()
  return addElement(wf, SCHEMA, data)
}

module.exports = {
  SCHEMA,
  TYPE,
  add,
  getAll,
  update: (wf, id, data) => updateElement(wf, COLLECTION_NAME, SCHEMA, id, data),
}
