const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

/**
  * @function getAll
  * @memberof Workflow.AndSplitGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type AND_SPLIT
  */

/**
  * @function add
  * @memberof Workflow.AndSplitGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new AND_SPLIT gateway to the workflow
  */

/**
  * @function remove
  * @memberof Workflow.AndSplitGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an AND_SPLIT gateway from the workflow
  */

const defaultInterface = createDefaultGatewayInterface(TYPES.AND_SPLIT)

delete defaultInterface.update

module.exports = defaultInterface
