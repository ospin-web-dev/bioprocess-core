/**
 * @namespace Workflow
 */
const Joi = require('joi')
const uuid = require('uuid')
const {
  Flows,
  Phases,
  EventDispatchers,
  EndEventDispatcher,
  EventListeners,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  Gateways,
  AndMergeGateway,
  AndSplitGateway,
  LoopGateway,
  OrMergeGateway,
} = require('./elements')

const getElementById = require('./functions/getElementById')
const validateSchema = require('./functions/validateSchema')
const createFromSchema = require('./functions/createFromSchema')

const SCHEMA = Joi.object({
  id: Joi.string().required(),
  version: Joi.string().default('1.0'),
  elements: Joi.object({
    eventDispatchers: Joi.array().items(EndEventDispatcher.SCHEMA).default([]),
    eventListeners: Joi.array().items(Joi.alternatives().try(
      ApprovalEventListener.SCHEMA,
      ConditionEventListener.SCHEMA,
      StartEventListener.SCHEMA,
      TimerEventListener.SCHEMA,
    )).default([]),
    flows: Joi.array().items(Flows.SCHEMA).default([]),
    gateways: Joi.array().items(Joi.alternatives().try(
      AndMergeGateway.SCHEMA,
      AndSplitGateway.SCHEMA,
      LoopGateway.SCHEMA,
      OrMergeGateway.SCHEMA,
    )).default([]),
    phases: Joi.array().items(Phases.SCHEMA).default([]),
  }).default(),
})

/**
 * @function create
 * @memberof Workflow
 * @arg {Object} initialData={}
 * @desc Creates a new workflow with the passed data.
 * It is recommended to use createTemplate instead
 */

const create = initialData => createFromSchema(initialData, SCHEMA)

/**
 * @function pipe
 * @memberof Workflow
 * @arg {Array} functions - an array of functions to be executed on the workflow
 * @arg {...*} initParams - the parameters for the first function to be called with
 * @desc Executes a series of functions on a workflow, whereby the parameters of the nth
 * function are passed into the (n + 1)th function
 */

const pipe = (functions, ...initParams) => {
  let params = initParams
  let firstExection = true

  /* eslint-disable no-restricted-syntax */
  for (const fn of functions) {
    const newParams = firstExection ? fn(...params) : fn(params)
    params = newParams
    firstExection = false
  }

  return params
}

/**
 * @function createTemplate
 * @memberof Workflow
 * @desc creates an empty workflow with the minumum required setup, including a START event
 * listener, a single phase, an APPROVAL event listener within the phase and an END dispatcher
 */

const createTemplate = () => {
  const id = uuid.v4()

  return pipe([
    create,
    StartEventListener.add,
    Phases.add,
    wf => Flows.add(wf, {
      srcId: StartEventListener.getAll(wf)[0].id,
      destId: Phases.getLast(wf).id,
    }),
    EndEventDispatcher.add,
    wf => ApprovalEventListener
      .add(wf, { phaseId: Phases.getLast(wf).id }),
    wf => Flows.add(wf, {
      srcId: ApprovalEventListener.getAll(wf)[0].id,
      destId: EndEventDispatcher.getAll(wf)[0].id,
    }),
  ], { id })

}

module.exports = {
  pipe,
  validateSchema: data => validateSchema(data, SCHEMA),
  getElementById,
  createTemplate,
  create,

  /**
   *  @namespace Workflow.Flows
   */

  Flows,

  /**
   *  @namespace Workflow.EventListeners
   */
  EventListeners,

  /**
   *  @namespace Workflow.EventDispatchers
   */
  EventDispatchers,

  /**
   *  @namespace Workflow.Phases
   */
  Phases,

  /**
   *  @namespace Workflow.Gateways
   */
  Gateways,

  /**
   *  @namespace Workflow.EndEventDispatcher
   */
  EndEventDispatcher,

  /**
   *  @namespace Workflow.ApprovalEventListener
   */
  ApprovalEventListener,

  /**
   *  @namespace Workflow.ConditionEventListener
   */
  ConditionEventListener,

  /**
   *  @namespace Workflow.StartEventListener
   */
  StartEventListener,

  /**
   *  @namespace Workflow.TimerEventListener
   */
  TimerEventListener,

  /**
   *  @namespace Workflow.AndMergeGateway
   */
  AndMergeGateway,

  /**
   *  @namespace Workflow.AndSplitGateway
   */
  AndSplitGateway,

  /**
   *  @namespace Workflow.LoopGateway
   */
  LoopGateway,

  /**
   *  @namespace Workflow.OrMergeGateway
   */
  OrMergeGateway,
}
