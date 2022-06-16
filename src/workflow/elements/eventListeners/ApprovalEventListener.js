const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

module.exports = createDefaultEventListenerInterface(TYPES.APPROVAL)
