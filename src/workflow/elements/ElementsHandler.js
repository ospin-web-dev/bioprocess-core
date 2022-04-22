const Workflow = require('../Workflow')

class ElementsHandler {

  static generateUniqueId(workflow) {
    const existingIds = Workflow.getExistingIds(workflow)
    let counter = 0
    let newId = `${this.ID_PREFIX}_${counter}`

    while (existingIds.includes(newId)) {
      counter += 1
      newId = `${this.ID_PREFIX}_${counter}`
    }

    return newId
  }

  static updateElements(workflow, updatedElements) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        [this.COLLECTION_NAME]: updatedElements,
      },
    }
  }

  static updateElementCollection(elements, updatedElement) {
    return elements.map(el => {
      if (el.id === updatedElement.id) {
        return updatedElement
      }
      return el
    })
  }

  static addElement(workflow, api, data) {
    const element = api.create({ ...data, id: this.generateUniqueId(workflow) })
    const elements = [ ...workflow.elements[this.COLLECTION_NAME], element]

    return this.updateElements(workflow, elements)
  }

  static updateElement(workflow, id, data) {
    const element = Workflow.getElementById(workflow.elements[this.COLLECTION_NAME], id)
    const updatedElement = { ...element, ...data }

    const api = this.getInterface(updatedElement)

    api.validateSchema(updatedElement)

    const updatedElements = this
      .updateElementCollection(workflow.elements[this.COLLECTION_NAME], updatedElement)

    return this.updateElements(workflow, updatedElements)
  }

  static removeElement(workflow, id) {
    const elements = workflow.elements[this.COLLECTION_NAME].filter(el => el.id !== id)
    return this.updateElements(workflow, elements)
  }

}

module.exports = ElementsHandler
