const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

/**
  * @function getAll
  * @memberof Workflow.OrGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type OR
  */

/**
  * @function add
  * @memberof Workflow.OrGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new OR gateway to the workflow
  */

/**
  * @function remove
  * @memberof Workflow.OrGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an OR gateway from the workflow
  */

const defaultInterface = createDefaultGatewayInterface(TYPES.OR)

delete defaultInterface.update

module.exports = defaultInterface
