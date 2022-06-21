const createElementSchema = require('../createElementSchema')
const createCommonSchema = require('./createCommonFlowSchema')
const addElement = require('../functions/addElement')
const removeElement = require('../functions/removeElement')
const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const ELEMENT_TYPE = 'FLOW'
const COLLECTION_NAME = 'flows'

/**
  * @function getAll
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @desc returns all flows
  */

/**
  * @function getLast
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @desc returns the last flow
  */

/**
  * @function getBy
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns the first flow matching the query
  */

/**
  * @function getManyBy
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns all flows matching the query
  */

/**
  * @function getById
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {String} id
  * @desc returns the flow matching the passed id
  */

/**
  * @function add
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string} initialData.srcId - the source element Id
  * @arg {string} initialData.destId - the destination element Id
  * @desc adds a new flow to the workflow
  */

/**
  * @function addLoopbackFlow
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {Object} initialData
  * @arg {string} initialData.srcId - the source element Id
  * @arg {string} initialData.destId - the destination element Id
  * @desc adds a new looback flow when connecting the loopback output of a LoopGateway
  */

/**
  * @function remove
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {id} id
  * @desc removes a flow from the workflow
  */

const common = createCommonCollectionInterface(COLLECTION_NAME)

const SCHEMA = createElementSchema(ELEMENT_TYPE)
  .concat(createCommonSchema())

/**
  * @function getIncomingFlows
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {String} elementId
  * @desc returns all incoming flows for an element
  */

const getIncomingFlows = (wf, elementId) => (
  common.getManyBy(wf, { destId: elementId })
)

/**
  * @function getOutgoingFlows
  * @memberof Workflow.Flows
  * @arg {Object} workflow
  * @arg {String} elementId
  * @desc returns all outgoing flows for an element
  */

const getOutgoingFlows = (wf, elementId) => (
  common.getManyBy(wf, { srcId: elementId })
)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  SCHEMA,
  add: (wf, data) => addElement(wf, COLLECTION_NAME, SCHEMA, data),
  remove: (wf, id) => removeElement(wf, COLLECTION_NAME, id),
  getIncomingFlows,
  getOutgoingFlows,
  ...common,
}
