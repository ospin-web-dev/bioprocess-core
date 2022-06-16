const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

module.exports = createDefaultGatewayInterface(TYPES.OR_MERGE)
