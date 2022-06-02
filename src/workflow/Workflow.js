const Joi = require('joi')
const uuid = require('uuid')

const EndEventDispatcher = require('./elements/eventDispatchers/EndEventDispatcher')

const ApprovalEventListener = require('./elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./elements/eventListeners/ConditionEventListener')
const StartEventListener = require('./elements/eventListeners/StartEventListener')
const TimerEventListener = require('./elements/eventListeners/TimerEventListener')

const Flow = require('./elements/flows/Flow')

const AndMergeGateway = require('./elements/gateways/AndMergeGateway')
const AndSplitGateway = require('./elements/gateways/AndSplitGateway')
const LoopGateway = require('./elements/gateways/LoopGateway')
const OrMergeGateway = require('./elements/gateways/OrMergeGateway')

const Phase = require('./elements/phases/Phase')

const EventListeners = require('./elements/eventListeners/EventListeners')
const Phases = require('./elements/phases/Phases')
const EventDispatchers = require('./elements/eventDispatchers/EventDispatchers')
const Flows = require('./elements/flows/Flows')

class Workflow {

  static get DEFAULT_VERSION() {
    return '1.0'
  }

  static validateSchema(data) {
    Joi.assert(data, Workflow.SCHEMA)
  }

  static _create(data) {
    return Joi.attempt(data, Workflow.SCHEMA)
  }

  static get SCHEMA() {
    return Joi.object({
      id: Joi.string().required(),
      version: Joi.string().required(),
      elements: Joi.object({
        eventDispatchers: Joi.array().items(EndEventDispatcher.SCHEMA).default([]),
        eventListeners: Joi.array().items(Joi.alternatives().try(
          ApprovalEventListener.SCHEMA,
          ConditionEventListener.SCHEMA,
          StartEventListener.SCHEMA,
          TimerEventListener.SCHEMA,
        )).default([]),
        flows: Joi.array().items(Flow.SCHEMA).default([]),
        gateways: Joi.array().items(Joi.alternatives().try(
          AndMergeGateway.SCHEMA,
          AndSplitGateway.SCHEMA,
          LoopGateway.SCHEMA,
          OrMergeGateway.SCHEMA,
        )).default([]),
        phases: Joi.array().items(Phase.SCHEMA).default([]),
      }).default(),
    })
  }

  static connect(workflow, srcId, destId) {
    return Flows.addFlow(workflow, { srcId, destId })
  }

  static createTemplate() {
    const id = uuid.v4()
    const workflow = Workflow._create({ version: Workflow.DEFAULT_VERSION, id })
    const workflowWithStartEvent = EventListeners
      .addStartEventListener(workflow)

    const workflowWithPhase = Phases.addPhase(workflowWithStartEvent)

    const startEvent = EventListeners.getAll(workflowWithPhase)[0]
    const firstPhase = Phases.getAll(workflowWithPhase)[0]
    const withPhaseConnected = Workflow.connect(workflowWithPhase, startEvent.id, firstPhase.id)

    return EventDispatchers.addEndEventDispatcher(withPhaseConnected)
  }

}

module.exports = Workflow
