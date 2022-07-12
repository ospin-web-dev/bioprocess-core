const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'eventListeners'
const ELEMENT_TYPE = 'EVENT_LISTENER'
const TYPES = {
  START: 'START',
  CONDITION: 'CONDITION',
  APPROVAL: 'APPROVAL',
  TIMER: 'TIMER',
}

/**
  * @function getAll
  * @memberof Workflow.EventListeners
  * @arg {Object} workflow
  * @desc returns all event listeners
  */

/**
  * @function getLast
  * @memberof Workflow.EventListeners
  * @arg {Object} workflow
  * @desc returns the last event listener
  */

/**
  * @function getBy
  * @memberof Workflow.EventListeners
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns the first event listener matching the query
  */

/**
  * @function getManyBy
  * @memberof Workflow.EventListeners
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns all event listeners matching the query
  */

/**
  * @function getById
  * @memberof Workflow.EventListeners
  * @arg {Object} workflow
  * @arg {String} id
  * @desc returns the event listener matching the passed id
  */

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
