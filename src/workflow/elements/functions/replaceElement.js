module.exports = (wf, collectionName, updatedElement) => ({
  ...wf,
  elements: {
    ...wf.elements,
    [collectionName]: wf.elements[collectionName].map(el => {
      if (el.id === updatedElement.id) {
        return updatedElement
      }
      return el
    }),
  },
})
