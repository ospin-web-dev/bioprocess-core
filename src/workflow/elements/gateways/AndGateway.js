const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

/**
  * @function getAll
  * @memberof Workflow.AndGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type AND
  */

/**
  * @function add
  * @memberof Workflow.AndGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new AND gateway to the workflow
  */

/**
  * @function remove
  * @memberof Workflow.AndGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an AND gateway from the workflow
  */

const defaultInterface = createDefaultGatewayInterface(TYPES.AND)

delete defaultInterface.update

module.exports = defaultInterface
