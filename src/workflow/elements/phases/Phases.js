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
    return this.add(workflow, Phase, data)
  }

  static isLastPhase(workflow) {
    return this.getAll(workflow).length === 1
  }

  static removePhase(workflow, phaseId) {
    if (Phases.isLastPhase(workflow)) {
      throw new Error('Cannot remove last phase')
    }
    return this.remove(workflow, phaseId)
  }

  static updatePhase(workflow, id, data) {
    return this.update(workflow, id, data)
  }

}

module.exports = Phases
