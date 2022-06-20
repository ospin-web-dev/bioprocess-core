const getAllElements = require('./getAllElements')

module.exports = (wf, collectionName, query) => (
  getAllElements(wf, collectionName).filter(el => {
    const keys = Object.keys(query)
    return keys.every(key => el[key] === query[key])
  })
)
