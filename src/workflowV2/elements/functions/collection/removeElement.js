const replaceElements = require('./replaceElements')
const getAllElements = require('./getAllElements')

module.exports = (wf, collectionName, id) => {
  const elements = getAllElements(wf, collectionName).filter(el => el.id !== id)
  return replaceElements(wf, elements)
}
