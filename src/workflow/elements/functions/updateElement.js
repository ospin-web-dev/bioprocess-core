const Joi = require('joi')
const getElementById = require('./getElementById')
const replaceElement = require('./replaceElement')

module.exports = (wf, collectionName, schema, id, data) => {
  const element = getElementById(wf, collectionName, id)
  const updatedElement = { ...element, ...data }

  Joi.assert(updatedElement, schema)

  return replaceElement(wf, collectionName, updatedElement)
}
