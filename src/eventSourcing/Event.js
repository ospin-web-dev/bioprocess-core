/* this file describes the expected events schema for events
 * published from the workflow engine to the cloud */
const Joi = require('joi')

const TYPES = {
  /* everyday events dispatched from normal execution */

  EVENT_RECEIVED: 'EVENT_RECEIVED',
  FLOW_SIGNALED: 'FLOW_SIGNALED',
  PHASE_STARTED: 'PHASE_STARTED',
  GATEWAY_ACTIVATED: 'GATEWAY_ACTIVATED',

  /* answers to user requested interventions */
  WORKFLOW_PAUSED: 'WORKFLOW_PAUSED',
  WORKFLOW_RESUMED: 'WORKFLOW_RESUMED',
  WORKFLOW_TERMINATED: 'WORKFLOW_TERMINATED',

  /* events coming from explicitly modelled event dispatchers */

  /* 'WORKFLOW FINISHED' comes from the EndEvent dispatcher
  /* when the workflow finishes correctly (as is not 'terminated') */
  WORKFLOW_FINISHED: 'WORKFLOW_FINISHED',
}

const BASE_SCHEMA = Joi.object({
  type: Joi.string().valid(...Object.values(Types)),
  createdAt: Joi.number().integer().strict().min(0).required(),
})

const DATA_SCHEMAS = {

}

const SCHEMA = {

}

module.exports = {
  TYPES,
}
