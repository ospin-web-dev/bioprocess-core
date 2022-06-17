const Joi = require('joi')
const createCommonEventDispatcherSchema = require('./createCommonEventDispatcherSchema')
const createElementSchema = require('../createElementSchema')
const addElement = require('../functions/collection/addElement')
const removeElement = require('../functions/collection/removeElement')
const getAllElements = require('../functions/collection/typeSpecific/getAllElements')
const { COLLECTION_NAME, ELEMENT_TYPE } = require('./EventDispatchers')

module.exports = (type, typeSpecificSchema = Joi.object()) => {

  const SCHEMA = createElementSchema(ELEMENT_TYPE)
    .concat(createCommonEventDispatcherSchema(type))
    .concat(typeSpecificSchema)

  return {
    SCHEMA,
    TYPE: type,
    getAll: wf => getAllElements(wf, COLLECTION_NAME, type),
    add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
    remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  }
}
