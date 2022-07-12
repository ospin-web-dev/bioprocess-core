const Joi = require('joi')
const createElementSchema = require('../createElementSchema')
const createCommonEventListenerSchema = require('./createCommonEventListenerSchema')
const addElement = require('../functions/addElement')
const updateElement = require('../functions/updateElement')
const removeElement = require('../functions/removeElement')
const getAllElementsByType = require('../functions/getAllElementsByType')
const { COLLECTION_NAME, ELEMENT_TYPE } = require('./EventListeners')

module.exports = (type, typeSpecificSchema = Joi.object()) => {

  const SCHEMA = createElementSchema(ELEMENT_TYPE)
    .concat(createCommonEventListenerSchema(type))
    .concat(typeSpecificSchema)

  return {
    SCHEMA,
    TYPE: type,
    add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
    getAll: wf => getAllElementsByType(wf, COLLECTION_NAME, type),
    update: (wf, id, data) => updateElement(wf, COLLECTION_NAME, SCHEMA, id, data),
    remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  }
}
