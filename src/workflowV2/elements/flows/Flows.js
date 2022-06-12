const ElementsHandler = require('../ElementsHandler')
const Flow = require('./Flow')

class Flows extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'flows'
  }

  static get ELEMENT_TYPE() {
    return Flow.ELEMENT_TYPE
  }

  static get ID_PREFIX() {
    return 'flow'
  }

  static getInterface() {
    return Flow
  }

  static add(workflow, data) {
    return this.addElement(workflow, Flow, data)
  }

  static remove(workflow, flowId) {
    return this.removeElement(workflow, flowId)
  }

  static update(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = Flows
