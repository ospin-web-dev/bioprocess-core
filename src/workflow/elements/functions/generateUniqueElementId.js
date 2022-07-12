const getAllElementIds = require('./getAllElementIds')

module.exports = (wf, collectionName) => {
  const idPrefix = collectionName.substr(0, collectionName.length - 1)
  const existingIds = getAllElementIds(wf, collectionName)
  let counter = 0
  let newId = `${idPrefix}_${counter}`

  while (existingIds.includes(newId)) {
    counter += 1
    newId = `${idPrefix}_${counter}`
  }

  return newId
}
