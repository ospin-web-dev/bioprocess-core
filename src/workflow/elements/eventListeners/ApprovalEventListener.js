const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const defaultInterface = createDefaultEventListenerInterface(TYPES.APPROVAL)

module.exports = defaultInterface
