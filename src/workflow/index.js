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
} = require('./elements/ElementInterfaces')

const getElementById = require('./functions/getElementById')
const validateSchema = require('./functions/validateSchema')
const createFromSchema = require('./functions/createFromSchema')
const validate = require('./validate')

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

const create = data => createFromSchema(data, SCHEMA)

const createTemplate = () => {
  const id = uuid.v4()
  const workflow = create({ id })
  const withStartEvent = StartEventListener.add(workflow)

  const withPhase = Phases.add(withStartEvent)

  const startEvent = EventListeners.getAll(withPhase)[0]
  const firstPhase = Phases.getAll(withPhase)[0]
  const withPhaseConnected = Flows.add(withPhase, { srcId: startEvent.id, destId: firstPhase.id })
  const withEndEventDispatcher = EndEventDispatcher.add(withPhaseConnected)

  const withPhaseApprovalEvent = ApprovalEventListener
    .add(withEndEventDispatcher, { phaseId: firstPhase.id })
  const approvalEvent = EventListeners.getAll(withPhaseApprovalEvent)[1]
  const endDispatcherEvent = EventDispatchers.getAll(withPhaseApprovalEvent)[0]
  return Flows
    .add(withPhaseApprovalEvent, { srcId: approvalEvent.id, destId: endDispatcherEvent.id })
}

module.exports = {
  validateSchema: data => validateSchema(data, SCHEMA),
  validate,
  getElementById,
  createTemplate,
  create,
  Flows,
  EventListeners,
  EventDispatchers,
  Phases,
  Gateways,
  EndEventDispatcher,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  AndMergeGateway,
  AndSplitGateway,
  LoopGateway,
  OrMergeGateway,
}
