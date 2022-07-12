module.exports = (wf, collectionName, updatedElements) => ({
  ...wf,
  elements: {
    ...wf.elements,
    [collectionName]: updatedElements,
  },
})
