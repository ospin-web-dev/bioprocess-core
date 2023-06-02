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

  /* events coming from dispatchers */
  DISPATCHED_EVENT: 'DISPATCHED_EVENT',

  /* answers to user requested interventions */
  WORKFLOW_PAUSED: 'WORKFLOW_PAUSED',
  WORKFLOW_RESUMED: 'WORKFLOW_RESUMED',
  WORKFLOW_TERMINATED: 'WORKFLOW_TERMINATED',

  /* 'WORKFLOW FINISHED' comes from the EndEvent dispatcher
  /* when the workflow finishes correctly (as is not 'terminated') */
  WORKFLOW_FINISHED: 'WORKFLOW_FINISHED',
}

const BASE_SCHEMA = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid(...Object.values(TYPES)).required(),
  // The device should report timestamps relative to process start,
  // while the cloud stores them with absolute time by adding the
  // time of the process start; This makes it easier to manage clock drift
  // on devices; Clock drifts only become a problem then if the device fails to
  // report the process start. In that case we could use the time of the start
  // command as an approximation for that edge case
  createdAt: Joi.number().integer().strict().min(0)
    .required(),
  // the number should be a monotonic counter, starting from 0
  // it helps to correctly indentify the order of events, even
  // if they happen at the exact same millisecond on the device;
  // firmware has to provide them; it can also be used for deduplication!
  number: Joi.number().integer().strict().min(0)
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
  [TYPES.DISPATCHED_EVENT]: Joi.object({
    eventDispatcherId: Joi.string().required(),
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
      is: TYPES.DISPATCHED_EVENT,
      then: DATA_SCHEMAS[TYPES.DISPATCHED_EVENT].required(),
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
