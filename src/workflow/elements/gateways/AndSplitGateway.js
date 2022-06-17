const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

const defaultInterface = createDefaultGatewayInterface(TYPES.AND_SPLIT)

delete defaultInterface.update

module.exports = defaultInterface
