const Joi = require('joi')
const getElementBy = require('./getElementBy')
const replaceElement = require('./replaceElement')

module.exports = (wf, collectionName, schema, id, data) => {
  const element = getElementBy(wf, collectionName, id)
  const updatedElement = { ...element, ...data }

  Joi.assert(updatedElement, schema)

  return replaceElement(wf.elements[collectionName], updatedElement)
}
