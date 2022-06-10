const ElementsHandler = require('../ElementsHandler')
const Flow = require('./Flow')

class Flows extends ElementsHandler {

  static get ELEMENT_TYPE() {
    return Flow.ELEMENT_TYPE
  }

  static get ID_PREFIX() {
    return 'flow'
  }

  static getInterface() {
    return Flow
  }

  static addFlow(workflow, data) {
    return this.add(workflow, Flow, data)
  }

  static removeFlow(workflow, flowId) {
    return this.remove(workflow, flowId)
  }

  static updateFlow(workflow, id, data) {
    return this.update(workflow, id, data)
  }

}

module.exports = Flows
