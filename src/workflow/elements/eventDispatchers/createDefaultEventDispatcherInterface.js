const Joi = require('joi')
const createElementSchema = require('../createElementSchema')
const createCommonEventDispatcherSchema = require('./createCommonEventDispatcherSchema')
const addElement = require('../functions/addElement')
const updateElement = require('../functions/updateElement')
const removeElement = require('../functions/removeElement')
const getAllElementsByType = require('../functions/getAllElementsByType')
const { COLLECTION_NAME, ELEMENT_TYPE } = require('./EventDispatchers')

module.exports = (type, typeSpecificSchema = Joi.object()) => {

  const SCHEMA = createElementSchema(ELEMENT_TYPE)
    .concat(createCommonEventDispatcherSchema(type))
    .concat(typeSpecificSchema)

  return {
    SCHEMA,
    TYPE: type,
    add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
    getAll: wf => getAllElementsByType(wf, COLLECTION_NAME, type),
    remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  }
}
