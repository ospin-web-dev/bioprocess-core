const { TYPES } = require('./Gateways')
const createDefaultGatewayInterface = require('./createDefaultGatewayInterface')

/**
  * @function getAll
  * @memberof Workflow.OrMergeGateway
  * @arg {Object} workflow
  * @desc returns all gateways of type OR_MERGE
  */

/**
  * @function add
  * @memberof Workflow.OrMergeGateway
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @desc adds a new OR_MERGE gateway to the workflow
  */

/**
  * @function remove
  * @memberof Workflow.OrMergeGateway
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes an OR_MERGE gateway from the workflow
  */

const defaultInterface = createDefaultGatewayInterface(TYPES.OR_MERGE)

delete defaultInterface.update

module.exports = defaultInterface
