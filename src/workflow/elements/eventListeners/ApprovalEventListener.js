const { TYPES } = require('./EventListeners')
const createDefaultEventListenerInterface = require('./createDefaultEventListenerInterface')

const defaultInterface = createDefaultEventListenerInterface(TYPES.APPROVAL)

delete defaultInterface.update

module.exports = defaultInterface
