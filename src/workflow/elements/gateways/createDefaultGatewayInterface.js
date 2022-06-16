const Joi = require('joi')
const gatewaySchema = require('./gatewaySchema')
const addElement = require('../functions/collection/addElement')
const updateElement = require('../functions/collection/updateElement')
const getAllElements = require('../functions/collection/typeSpecific/getAllElements')
const { COLLECTION_NAME } = require('./Gateways')

const createDefaultSchema = type => (
  gatewaySchema.concat(Joi.object({
    type: Joi.string().allow(type).default(type),
  }))
)

module.exports = (type, schema = createDefaultSchema(type)) => ({
  SCHEMA: schema,
  TYPE: type,
  add: (wf, data) => addElement(wf, COLLECTION_NAME, schema, data),
  getAll: wf => getAllElements(wf, COLLECTION_NAME, type),
  update: (wf, id, data) => updateElement(wf, COLLECTION_NAME, schema, id, data),
})
