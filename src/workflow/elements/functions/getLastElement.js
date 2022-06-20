const getAllElements = require('./getAllElements')

module.exports = (wf, collectionName) => {
  const all = getAllElements(wf, collectionName)
  return all[all.length - 1]
}
