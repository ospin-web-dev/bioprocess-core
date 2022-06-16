module.exports = (wf, collectionName, type) => (
  wf.elements[collectionName].filter(el => el.type === type)
)
