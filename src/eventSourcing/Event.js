/* this file describes the expected events schema for events
 * published from the workflow engine to the cloud */
const Joi = require('joi')

/**
 *  @namespace EventSourcing
 */

const TYPES = {
  /* everyday events dispatched from normal execution */

  EVENT_LISTENER_ACTIVATED: 'EVENT_LISTENER_ACTIVATED',
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
  id: Joi.string().required(),
  type: Joi.sring().valid(...Object.values(TYPES)).required(),
  createdAt: Joi.number().integer().strict().min(0)
    .required(),
})

const DATA_SCHEMAS = {
  [TYPES.EVENT_LISTENER_ACTIVATED]: Joi.object({
    eventListenerId: Joi.string().required(),
  }),
  [TYPES.EVENT_RECEIVED]: Joi.object({
    eventListenerId: Joi.string().required(),
    forced: Joi.boolean().strict().default(false),
  }),
  [TYPES.FLOW_SIGNALED]: Joi.object({
    flowId: Joi.string().required(),
  }),
  [TYPES.PHASE_STARTED]: Joi.object({
    phasId: Joi.string().required(),
  }),
  [TYPES.GATEWAY_ACTIVATED]: Joi.object({
    gatewayId: Joi.string().required(),
  }),
}

const SCHEMA = BASE_SCHEMA.concat(Joi.object({
  data: Joi.any().when('type',
    {
      is: TYPES.EVENT_LISTENER_ACTIVATED,
      then: DATA_SCHEMAS[TYPES.EVENT_RECEIVED].required(),
    },
    {
      is: TYPES.EVENT_RECEIVED,
      then: DATA_SCHEMAS[TYPES.EVENT_RECEIVED].required(),
    },
    {
      is: TYPES.PHASE_STARTED,
      then: DATA_SCHEMAS[TYPES.PHASE_STARTED].required(),
    },
    {
      is: TYPES.GATEWAY_ACTIVATED,
      then: DATA_SCHEMAS[TYPES.GATEWAY_ACTIVATED].required(),
    },
    {
      is: TYPES.FLOW_SIGNALED,
      then: DATA_SCHEMAS[TYPES.FLOW_SIGNALED].required(),
      otherwise: Joi.forbidden(),
    }),
}))

module.exports = {
  TYPES,
  SCHEMA,
}
