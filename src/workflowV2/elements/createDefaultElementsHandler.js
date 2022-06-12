const Joi = require('joi')

const createDefaultElementsHandler = collectionName => {

  const getElementId = el => el.id

  const getAll = wf => wf.elements[collectionName]

  const getLast = wf => {
    const all = getAll(wf)
    return all[all.length - 1]
  }

  const getBy = (wf, query) => (
    wf.elements[collectionName].find(el => {
      const keys = Object.keys(query)
      return keys.every(key => el[key] === query[key])
    })
  )

  const getById = (wf, id) => getBy(wf, { id })

  const getManyBy = (wf, query) => (
    wf.elements[collectionName].filter(el => {
      const keys = Object.keys(query)
      return keys.every(key => el[key] === query[key])
    })
  )

  const create = (data, schema) => Joi.attempt(data, schema)

  const getExistingIds = wf => wf.elements[collectionName].map(getElementId)

  const generateUniqueId = wf => {
    const idPrefix = collectionName.substr(0, collectionName.length - 1)
    const existingIds = getExistingIds(wf)
    let counter = 0
    let newId = `${idPrefix}_${counter}`

    while (existingIds.includes(newId)) {
      counter += 1
      newId = `${idPrefix}_${counter}`
    }

    return newId
  }

  const replaceAll = (wf, updatedElements) => ({
    ...wf,
    elements: {
      ...wf.elements,
      [collectionName]: updatedElements,
    },
  })

  const replace = (elements, updatedElement) => (
    elements.map(el => {
      if (el.id === updatedElement.id) {
        return updatedElement
      }
      return el
    })
  )

  const add = (wf, data, elementSchema) => {
    const element = create({ ...data, id: generateUniqueId(wf) }, elementSchema)
    const elements = [ ...wf.elements[collectionName], element]
    return replaceAll(wf, elements)
  }

  const update = (wf, id, data, elementSchema) => {
    const element = getById(wf, id)
    const updatedElement = { ...element, ...data }

    Joi.assert(updatedElement, elementSchema)

    const updatedElements = replace(wf.elements[collectionName], updatedElement)

    return replaceAll(wf, updatedElements)
  }

  const remove = (workflow, id) => {
    const elements = workflow.elements[collectionName].filter(el => el.id !== id)
    return replaceAll(workflow, elements)
  }

  return {
    getAll,
    getLast,
    getBy,
    getById,
    getManyBy,
    remove,
    add,
    update,
  }

}

module.exports = createDefaultElementsHandler
