const Joi = require('joi')
const generateUniqueElementId = require('./generateUniqueElementId')
const replaceElements = require('./replaceElements')

module.exports = (wf, collectionName, schema, data) => {
  const element = Joi
    .attempt({ ...data, id: generateUniqueElementId(wf, collectionName) }, schema)
  const elements = [ ...wf.elements[collectionName], element]
  return replaceElements(wf, collectionName, elements)
}
