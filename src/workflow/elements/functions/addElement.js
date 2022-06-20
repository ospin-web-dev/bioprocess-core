const generateUniqueElementId = require('./generateUniqueElementId')
const replaceElements = require('./replaceElements')
const createFromSchema = require('../../functions/createFromSchema')

module.exports = (wf, collectionName, schema, data) => {
  const element = createFromSchema({
    ...data,
    id: generateUniqueElementId(wf, collectionName),
  }, schema)
  const elements = [ ...wf.elements[collectionName], element]
  return replaceElements(wf, collectionName, elements)
}
