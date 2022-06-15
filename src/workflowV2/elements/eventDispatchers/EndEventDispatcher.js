const { TYPES } = require('./EventDispatchers')
const createDefaultEventDispatcherInterface = require('./createDefaultEventDispatcherInterface')

module.exports = createDefaultEventDispatcherInterface(TYPES.END)
