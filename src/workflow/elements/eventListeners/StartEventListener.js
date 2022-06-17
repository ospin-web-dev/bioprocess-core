const { TYPES } = require('./EventListeners')
const IncorrectAmountOfStartEventListenersError = require('../../validator/errors/IncorrectAmountOfStartEventListenersError')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const defaultInterface = createDefaultEventListenerInterface(TYPES.START)

const add = (wf, data) => {
  const startListeners = defaultInterface.getAll(wf)
  if (startListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()
  return defaultInterface.add(wf, data)
}

const remove = (wf, id) => {
  const startListeners = defaultInterface.getAll(wf)
  if (startListeners.length === 0) throw new IncorrectAmountOfStartEventListenersError()
  return defaultInterface.remove(wf, id)
}

module.exports = {
  ...defaultInterface,
  add,
  remove,
}
