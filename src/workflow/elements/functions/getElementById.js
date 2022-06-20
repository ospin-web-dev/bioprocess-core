const getElementBy = require('./getElementBy')

module.exports = (wf, collectionName, id) => (
  getElementBy(wf, collectionName, { id })
)
