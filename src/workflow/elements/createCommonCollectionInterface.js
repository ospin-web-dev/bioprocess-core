const getAllElements = require('./functions/getAllElements')
const getElementBy = require('./functions/getElementBy')
const getElementById = require('./functions/getElementById')
const getLastElement = require('./functions/getLastElement')
const getManyElementsBy = require('./functions/getManyElementsBy')

module.exports = collectionName => ({
  getAll: wf => getAllElements(wf, collectionName),
  getBy: (wf, query) => getElementBy(wf, collectionName, query),
  getById: (wf, id) => getElementById(wf, collectionName, id),
  getLast: wf => getLastElement(wf, collectionName),
  getManyBy: (wf, query) => getManyElementsBy(wf, collectionName, query),
})
