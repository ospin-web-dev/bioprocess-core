const getAllElements = require('../functions/collection/getAllElements')
const getElementBy = require('../functions/collection/getElementBy')
const getElementById = require('../functions/collection/getElementById')
const getLastElement = require('../functions/collection/getLastElement')
const getManyElementsBy = require('../functions/collection/getManyElementsBy')

module.exports = collectionName => ({
  getAll: wf => getAllElements(wf, collectionName),
  getBy: (wf, query) => getElementBy(wf, collectionName, query),
  getById: (wf, id) => getElementById(wf, collectionName, id),
  getLast: wf => getLastElement(wf, collectionName),
  getManyBy: (wf, query) => getManyElementsBy(wf, collectionName, query),
})
