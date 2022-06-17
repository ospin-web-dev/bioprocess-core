const { TYPES } = require('./EventDispatchers')
const NoEndEventDispatcherError = require('../../validator/errors/NoEndEventDispatcherError')
const createDefaultEventDispatcherInterface = require('./createDefaultEventDispatcherInterface')

const defaultInterface = createDefaultEventDispatcherInterface(TYPES.END)

const isLastEndEventDispatcher = wf => {
  const dispatchers = defaultInterface.getAll(wf)
  return dispatchers.length === 1
}

const remove = (wf, eventDispatcherId) => {
  if (isLastEndEventDispatcher(wf)) {
    throw new NoEndEventDispatcherError()
  }
  return defaultInterface.remove(wf, eventDispatcherId)
}

module.exports = {
  ...defaultInterface,
  remove,
}
