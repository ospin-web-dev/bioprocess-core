const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'gateways'
const ELEMENT_TYPE = 'GATEWAY'
const TYPES = {
  AND: 'AND',
  OR: 'OR',
  CONDITIONAL: 'CONDITIONAL',
}

/**
  * @function getAll
  * @memberof Workflow.Gateways
  * @arg {Object} workflow
  * @desc returns all gateways
  */

/**
  * @function getLast
  * @memberof Workflow.Gateways
  * @arg {Object} workflow
  * @desc returns the last gateway
  */

/**
  * @function getBy
  * @memberof Workflow.Gateways
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns the first gateway matching the query
  */

/**
  * @function getManyBy
  * @memberof Workflow.Gateways
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns all gateways matching the query
  */

/**
  * @function getById
  * @memberof Workflow.Gateways
  * @arg {Object} workflow
  * @arg {String} id
  * @desc returns the gateway matching the passed id
  */

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
