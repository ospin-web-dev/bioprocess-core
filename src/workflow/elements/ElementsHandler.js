class ElementsHandler {

  static getAll(workflow) {
    return workflow.elements.filter(el => el.elementType === this.ELEMENT_TYPE)
  }

  static getLast(workflow) {
    const all = this.getAll(workflow)
    return all[all.length - 1]
  }

  static getManyBy(workflow, query) {
    return this
      .getAll(workflow)
      .filter(el => {
        const keys = Object.keys(query)
        return keys.every(key => el[key] === query[key])
      })
  }

  static getBy(workflow, query) {
    return this.getAll(workflow).find(el => {
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
    return workflow.elements.map(el => el.id)
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
      elements: [
        ...updatedElements,
      ],
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
    const element = api.create({
      ...data,
      id: this.generateUniqueId(workflow),
    })
    const elements = [ ...workflow.elements, element]

    return this.replaceAll(workflow, elements)
  }

  static update(workflow, id, data) {
    const element = this.getById(workflow, id)
    const updatedElement = { ...element, ...data }

    const api = this.getInterface(updatedElement)

    api.validateSchema(updatedElement)

    const updatedElements = this.replace(workflow.elements, updatedElement)

    return this.replaceAll(workflow, updatedElements)
  }

  static remove(workflow, id) {
    const elements = workflow.elements.filter(el => el.id !== id)
    return this.replaceAll(workflow, elements)
  }

}

module.exports = ElementsHandler
