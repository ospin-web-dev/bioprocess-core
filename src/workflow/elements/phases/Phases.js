const ElementsHandler = require('../ElementsHandler')

const Phase = require('./Phase')

class Phases extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'phases'
  }

  static get ID_PREFIX() {
    return 'phase'
  }

  static getInterface() {
    return Phase
  }

  static addPhase(workflow, data = {}) {
    return this.addElement(workflow, Phase, data)
  }

  static removePhase(workflow, phaseId) {
    return this.removeElement(workflow, phaseId)
  }

  static updatePhase(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = Phases
