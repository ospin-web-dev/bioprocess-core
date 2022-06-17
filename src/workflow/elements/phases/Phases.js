const createCollectionGetters = require('../compositions/createCollectionGetters')
const addElement = require('../functions/collection/addElement')
const removeElement = require('../functions/collection/removeElement')
const updateElement = require('../functions/collection/updateElement')
const Command = require('./commands/Command')
const createElementSchema = require('../createElementSchema')
const createCommonPhaseSchema = require('./createCommonPhaseSchema')
const NoPhasesError = require('../../validator/errors/NoPhasesError')

const ELEMENT_TYPE = 'PHASE'
const COLLECTION_NAME = 'phases'

const SCHEMA = createElementSchema(ELEMENT_TYPE).concat(createCommonPhaseSchema())

const {
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
} = createCollectionGetters(COLLECTION_NAME)

const add = (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data)
const update = (wf, id, data) => updateElement(wf, COLLECTION_NAME, SCHEMA, id, data)

const isLastPhase = wf => (
  getAll(wf).length === 1
)

const remove = (wf, phaseId) => {
  if (isLastPhase(wf)) {
    throw new NoPhasesError()
  }
  return removeElement(wf, COLLECTION_NAME, phaseId)
}

const getExistingPhaseCommandIds = (wf, phaseId) => {
  const phase = getById(wf, phaseId)
  return phase.commands.map(command => command.phaseId)
}

const generateUniqueCommandId = (wf, phaseId) => {
  const existingIds = getExistingPhaseCommandIds(wf, phaseId)
  let counter = 0
  const prefix = 'command'
  let newId = `${prefix}_${counter}`

  while (existingIds.includes(newId)) {
    counter += 1
    newId = `${prefix}_${counter}`
  }

  return newId
}

const addCommand = (wf, phaseId, command) => {
  const phase = getById(wf, phaseId)
  const commandWithId = Command.create({ ...command, id: generateUniqueCommandId(wf, phaseId) })
  return update(wf, phaseId, { commands: [ ...phase.commands, commandWithId ] })
}

const updateCommand = (wf, phaseId, updatedCommand) => {
  const phase = getById(wf, phaseId)
  const updatedCommands = phase.commands.map(command => {
    if (command.id === updatedCommand.id) return updatedCommand
    return command
  })
  return update(wf, phaseId, { commands: updatedCommands })
}

const removeCommand = (wf, phaseId, commandId) => {
  const phase = getById(wf, phaseId)
  const updatedCommands = phase.commands.filter(command => command.id !== commandId)
  return update(wf, phaseId, { commands: updatedCommands })
}

const getCommandByType = (wf, phaseId, commandType) => {
  const phase = getById(wf, phaseId)
  return phase.commands.find(command => command.type === commandType)
}

const getSetTargetCommand = (wf, phaseId) => (
  getCommandByType(wf, phaseId, Command.TYPES.SET_TARGETS)
)

const updateSetTargetValueCommand = (wf, phaseId, fctId, slotName, value) => {
  const command = getSetTargetCommand(wf, phaseId)

  const existingTargetValue = command.data.targets
    .some(target => target.fctId === fctId && target.slotName === slotName)

  const updatedTargets = existingTargetValue
    ? command.data.targets.map(target => {
      if (target.fctId === fctId && target.slotName === slotName) {
        return { ...target, target: value }
      }
      return target
    })
    : [ ...command.data.targets, { fctId, slotName, target: value } ]

  const updatedCommand = {
    ...command,
    data: {
      ...command.data,
      targets: updatedTargets,
    },
  }

  return updateCommand(wf, phaseId, updatedCommand)
}

const setTargetValue = (wf, phaseId, fctId, slotName, value) => {
  const existingSetTargetCommand = getSetTargetCommand(wf, phaseId)

  if (!existingSetTargetCommand) {
    const command = {
      type: Command.TYPES.SET_TARGETS,
      data: { targets: [] },
    }
    return updateSetTargetValueCommand(
      addCommand(wf, phaseId, command),
      phaseId,
      fctId,
      slotName,
      value,
    )
  }
  return updateSetTargetValueCommand(wf, phaseId, fctId, slotName, value)
}

const getTargetValue = (wf, phaseId, fctId, slotName) => {
  const existingSetTargetCommand = getCommandByType(wf, phaseId, Command.TYPES.SET_TARGETS)

  if (!existingSetTargetCommand) return

  const targetEntry = existingSetTargetCommand.data.targets.find(target => (
    target.fctId === fctId && target.slotName === slotName
  ))

  if (targetEntry) return targetEntry.target
}

module.exports = {
  COLLECTION_NAME,
  SCHEMA,
  ELEMENT_TYPE,
  add,
  addCommand,
  getAll,
  getBy,
  getById,
  getLast,
  getManyBy,
  getTargetValue,
  isLastPhase,
  remove,
  removeCommand,
  setTargetValue,
  update,
  updateCommand,
}
