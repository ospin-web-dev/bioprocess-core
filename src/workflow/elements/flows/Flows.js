const ElementsHandler = require('../ElementsHandler')
const Flow = require('./Flow')

class Flows extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'flows'
  }

  static get ID_PREFIX() {
    return 'flow'
  }

  static getInterface() {
    return Flow
  }

  static addFlow(workflow, data) {
    return this.addElement(workflow, Flow, data)
  }

  static removeFlow(workflow, flowId) {
    return this.removeElement(workflow, flowId)
  }

  static updateFlow(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = Flows
