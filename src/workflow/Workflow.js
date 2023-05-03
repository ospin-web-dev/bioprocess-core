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
  AlertEventDispatcher,
  EventListeners,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  Gateways,
  AndGateway,
  OrGateway,
  ConditionalGateway,
} = require('./elements')

const getElementById = require('./functions/getElementById')
const validateSchema = require('./functions/validateSchema')
const createFromSchema = require('./functions/createFromSchema')

const SCHEMA = Joi.object({
  id: Joi.string().required(),
  version: Joi.string().default('1.0'),
  elements: Joi.object({
    eventDispatchers: Joi.array().items(Joi.alternatives().try(
      EndEventDispatcher.SCHEMA,
      AlertEventDispatcher.SCHEMA,
    )).default([]),
    eventListeners: Joi.array().items(Joi.alternatives().try(
      ApprovalEventListener.SCHEMA,
      ConditionEventListener.SCHEMA,
      StartEventListener.SCHEMA,
      TimerEventListener.SCHEMA,
    )).default([]),
    flows: Joi.array().items(Flows.SCHEMA).default([]),
    gateways: Joi.array().items(Joi.alternatives().try(
      AndGateway.SCHEMA,
      OrGateway.SCHEMA,
      ConditionalGateway.SCHEMA,
    )).default([]),
    phases: Joi.array().items(Phases.SCHEMA).default([]),
  }).default(),
})

/**
 * @function create
 * @memberof Workflow
 * @arg {Object} initialData={}
 * @desc creates a new workflow with the passed data.
 * <strong>It is recommended to use createTemplate instead</strong>
 */

const create = initialData => createFromSchema(initialData, SCHEMA)

/**
 * @function pipe
 * @memberof Workflow
 * @arg {Array} functions - an array of functions to be executed on the workflow
 * @arg {...*} initParams - the parameters for the first function to be called with
 * @desc executes a series of functions on a workflow, whereby the parameters of the nth
 * function are passed into the (n + 1)th function
 */

const pipe = (functions, ...initParams) => (
  functions.reduce((res, fn, idx) => (idx > 0 ? fn(res) : fn(...res)), initParams)
)

/**
 * @function createTemplate
 * @memberof Workflow
 * @desc creates an empty workflow with the minimum required setup, including a START event
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

const isSingleThreaded = wf => {
  // There are 4 ways how a new execution thread can be introduced:
  // 1. OrGateway with multiple outflows
  // 2. AndGateway with multiple outflows
  // 3. A non-interrupting phase event listener
  // 4. A global event listener (that is not the START) without
  // in incoming flow (which makes it active per default);
  // even if this is false, the real execution of a the workflow
  // might still be single-threaded

  const gatewayCondition = Gateways.getAll(wf)
    .filter(gw => gw.type === Gateways.TYPES.OR || gw.type === Gateways.TYPES.AND)
    .map(gw => Flows.getOutgoingFlows(wf, gw.id).length)
    .some(totalOutFlows => totalOutFlows > 1)
  if (gatewayCondition) return false

  const nonInterruptingEventListenersCondition = EventListeners
    .getManyBy(wf, { interrupting: false })
    .some(el => el.phase !== null)
  if (nonInterruptingEventListenersCondition) return false

  const globalEventListenerCondition = EventListeners.getManyBy(wf, { phaseId: null })
    .filter(el => el.type !== EventListeners.TYPES.START)
    .map(el => Flows.getIncomingFlows(wf, el.id).length)
    .some(totalInflows => totalInflows === 0)
  if (globalEventListenerCondition) return false

  return true
}

const isLinear = wf => {
  // a linear process is single threaded and every phase has only one event listener
  const singleThreaded = isSingleThreaded(wf)
  if (!singleThreaded) return false

  return Phases.getAll(wf)
    .every(phase => EventListeners.getManyBy(wf, { phaseId: phase.id }).length <= 1)
}

module.exports = {
  pipe,
  validateSchema: data => validateSchema(data, SCHEMA),
  getElementById,
  createTemplate,
  create,
  isSingleThreaded,
  isLinear,

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
   *  @namespace Workflow.AlertEventDispatcher
   */
  AlertEventDispatcher,

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
   *  @namespace Workflow.AndGateway
   */
  AndGateway,

  /**
   *  @namespace Workflow.OrGateway
   */
  OrGateway,

  /**
   *  @namespace Workflow.ConditionalGateway
   */
  ConditionalGateway,
}
