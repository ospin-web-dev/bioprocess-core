const createCommonCollectionInterface = require('../createCommonCollectionInterface')

const COLLECTION_NAME = 'eventDispatchers'
const ELEMENT_TYPE = 'EVENT_DISPATCHER'
const TYPES = { END: 'END' }

/**
  * @function getAll
  * @memberof Workflow.EventDispatchers
  * @arg {Object} workflow
  * @desc returns all event dispatchers
  */

/**
  * @function getLast
  * @memberof Workflow.EventDispatchers
  * @arg {Object} workflow
  * @desc returns the last event dispatcher
  */

/**
  * @function getBy
  * @memberof Workflow.EventDispatchers
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns the first event dispatcher matching the query
  */

/**
  * @function getManyBy
  * @memberof Workflow.EventDispatchers
  * @arg {Object} workflow
  * @arg {Object} query
  * @desc returns all event dispatchers matching the query
  */

/**
  * @function getById
  * @memberof Workflow.EventDispatchers
  * @arg {Object} workflow
  * @arg {String} id
  * @desc returns the event dispatcher matching the passed id
  */

const common = createCommonCollectionInterface(COLLECTION_NAME)

module.exports = {
  COLLECTION_NAME,
  ELEMENT_TYPE,
  TYPES,
  ...common,
}
