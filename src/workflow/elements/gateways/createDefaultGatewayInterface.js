const Joi = require('joi')
const createElementSchema = require('../createElementSchema')
const createCommonGatewaySchema = require('./createCommonGatewaySchema')
const addElement = require('../functions/addElement')
const updateElement = require('../functions/updateElement')
const removeElement = require('../functions/removeElement')
const getAllElementsByType = require('../functions/getAllElementsByType')
const { COLLECTION_NAME, ELEMENT_TYPE } = require('./Gateways')

module.exports = (type, typeSpecificSchema = Joi.object()) => {

  const SCHEMA = createElementSchema(ELEMENT_TYPE)
    .concat(createCommonGatewaySchema(type))
    .concat(typeSpecificSchema)

  return {
    SCHEMA,
    TYPE: type,
    getAll: wf => getAllElementsByType(wf, COLLECTION_NAME, type),
    add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
    update: (wf, id, data) => updateElement(wf, COLLECTION_NAME, SCHEMA, id, data),
    remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  }
}
