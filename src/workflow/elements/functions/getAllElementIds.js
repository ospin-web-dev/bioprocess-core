const getAllElements = require('./getAllElements')

module.exports = (wf, collectionName) => (
  getAllElements(wf, collectionName).map(el => el.id)
)
