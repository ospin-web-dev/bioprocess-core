const getAllElements = require('./getAllElements')

module.exports = (wf, collectionName, type) => (
  getAllElements(wf, collectionName).filter(el => el.type === type)
)
