const { TYPES } = require('./EventListeners')
const IncorrectAmountOfStartEventListenersError = require('../../validator/errors/IncorrectAmountOfStartEventListenersError')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const defaultInterface = createDefaultEventListenerInterface(TYPES.START)

delete defaultInterface.update

const add = (wf, data) => {
  const startListeners = defaultInterface.getAll(wf)
  if (startListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()
  return defaultInterface.add(wf, data)
}

module.exports = {
  ...defaultInterface,
  add,
}
