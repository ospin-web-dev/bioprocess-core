const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

const defaultInterface = createDefaultGatewayInterface(TYPES.OR_MERGE)

delete defaultInterface.update

module.exports = defaultInterface
