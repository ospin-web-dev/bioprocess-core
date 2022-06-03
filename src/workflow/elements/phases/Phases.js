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

  static getExistingPhaseCommandIds(workflow, id) {
    const phase = this.getById(workflow, id)
    return phase.commands.map(command => command.id)
  }

  static generateUniqueCommandId(workflow, id) {
    const existingIds = this.getExistingIds(workflow, id)
    let counter = 0
    const prefix = 'command'
    let newId = `${prefix}_${counter}`

    while (existingIds.includes(newId)) {
      counter += 1
      newId = `${prefix}_${counter}`
    }

    return newId
  }

  static addCommand(workflow, id, command) {
    const phase = this.getById(workflow, id)
    const commandWithId = { ...command, id: Phases.generateUniqueCommandId(workflow, id) }
    return this.updatePhase(workflow, id, { commands: commandWithId })
  }

  static updateCommand(workflow, id, commandId, data) {
    const phase = this.getById(workflow, id)
    const updatedCommands = phase.commands.map(command => {
      if (command.id === commandId) return { ...command, ...data }
      return command
    })
    return this.updatePhase(workflow, id, { commands: updatedCommands })
  }

  static removeCommand(workflow, id, commandId) {
    const phase = this.getById(workflow, id)
    const updatedCommands = phase.commands.filter(command => command.id !== commandId)
    return this.updatePhase(workflow, id, { commands: updatedCommands })
  }

}

module.exports = Phases
