const Joi = require('joi')
const createElementSchema = require('../createElementSchema')
const createCommonGatewaySchema = require('./createCommonGatewaySchema')
const addElement = require('../functions/collection/addElement')
const updateElement = require('../functions/collection/updateElement')
const getAllElements = require('../functions/collection/typeSpecific/getAllElements')
const { COLLECTION_NAME, ELEMENT_TYPE } = require('./Gateways')

module.exports = (type, schema = Joi.object()) => {

  const SCHEMA = createElementSchema(ELEMENT_TYPE)
    .concat(createCommonGatewaySchema(type))
    .concat(schema)

  return {
    SCHEMA,
    TYPE: type,
    add: (wf, data) => addElement(wf, COLLECTION_NAME, schema, data),
    getAll: wf => getAllElements(wf, COLLECTION_NAME, type),
    update: (wf, id, data) => updateElement(wf, COLLECTION_NAME, schema, id, data),
  }
}
