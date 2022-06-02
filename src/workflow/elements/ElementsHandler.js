class ElementsHandler {

  static getAll(workflow) {
    return workflow.elements[this.COLLECTION_NAME]
  }

  static getManyBy(workflow, query) {
    return workflow.elements[this.COLLECTION_NAME].filter(el => {
      const keys = Object.keys(query)
      return keys.every(key => el[key] === query[key])
    })
  }

  static getBy(workflow, query) {
    return workflow.elements[this.COLLECTION_NAME].find(el => {
      const keys = Object.keys(query)
      return keys.every(key => el[key] === query[key])
    })
  }

  static getElementId(element) {
    return element.id
  }

  static getById(workflow, id) {
    return this.getBy(workflow, { id })
  }

  static getExistingIds(workflow) {
    const {
      elements: {
        eventDispatchers,
        eventListeners,
        flows,
        gateways,
        phases,
      },
    } = workflow

    return [
      ...eventDispatchers.map(ElementsHandler.getElementId),
      ...eventListeners.map(ElementsHandler.getElementId),
      ...flows.map(ElementsHandler.getElementId),
      ...gateways.map(ElementsHandler.getElementId),
      ...phases.map(ElementsHandler.getElementId),
    ]
  }

  static generateUniqueId(workflow) {
    const existingIds = this.getExistingIds(workflow)
    let counter = 0
    let newId = `${this.ID_PREFIX}_${counter}`

    while (existingIds.includes(newId)) {
      counter += 1
      newId = `${this.ID_PREFIX}_${counter}`
    }

    return newId
  }

  static replaceAll(workflow, updatedElements) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        [this.COLLECTION_NAME]: updatedElements,
      },
    }
  }

  static replace(elements, updatedElement) {
    return elements.map(el => {
      if (el.id === updatedElement.id) {
        return updatedElement
      }
      return el
    })
  }

  static add(workflow, api, data) {
    const element = api.create({ ...data, id: this.generateUniqueId(workflow) })
    const elements = [ ...workflow.elements[this.COLLECTION_NAME], element]

    return this.replaceAll(workflow, elements)
  }

  static update(workflow, id, data) {
    const element = this.getById(workflow, id)
    const updatedElement = { ...element, ...data }

    const api = this.getInterface(updatedElement)

    api.validateSchema(updatedElement)

    const updatedElements = this
      .replace(workflow.elements[this.COLLECTION_NAME], updatedElement)

    return this.replaceAll(workflow, updatedElements)
  }

  static remove(workflow, id) {
    const elements = workflow.elements[this.COLLECTION_NAME].filter(el => el.id !== id)
    return this.replaceAll(workflow, elements)
  }

}

module.exports = ElementsHandler
