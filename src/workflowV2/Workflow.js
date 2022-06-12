const Joi = require('joi')
const uuid = require('uuid')

const EventDispatcher = require('./elements/eventDispatchers/EventDispatcher')
const EventDispatchers = require('./elements/eventDispatchers/EventDispatchers')
const EndEventDispatcher = require('./elements/eventDispatchers/EndEventDispatcher')

const EventListener = require('./elements/eventListeners/EventListener')
const EventListeners = require('./elements/eventListeners/EventListeners')
const ApprovalEventListener = require('./elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./elements/eventListeners/ConditionEventListener')
const StartEventListener = require('./elements/eventListeners/StartEventListener')
const TimerEventListener = require('./elements/eventListeners/TimerEventListener')

const Flow = require('./elements/flows/Flow')
const Flows = require('./elements/flows/Flows')

const Gateway = require('./elements/gateways/Gateway')
const Gateways = require('./elements/gateways/Gateways')
const AndMergeGateway = require('./elements/gateways/AndMergeGateway')
const AndSplitGateway = require('./elements/gateways/AndSplitGateway')
const LoopGateway = require('./elements/gateways/LoopGateway')
const OrMergeGateway = require('./elements/gateways/OrMergeGateway')

const Phase = require('./elements/phases/Phase')
const Phases = require('./elements/phases/Phases')

const ForbiddenConnectionError = require('./validator/errors/ForbiddenConnectionError')
const IncorrectAmountOfOutgoingFlowsError = require('./validator/errors/IncorrectAmountOfOutgoingFlowsError')
const IncorrectAmountOfIncomingFlowsError = require('./validator/errors/IncorrectAmountOfIncomingFlowsError')
const IncorrectElementTypeError = require('./validator/errors/IncorrectElementTypeError')

() => {

  const DEFAULT_VERSION = '1.0'
  const SCHEMA = Joi.object({
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

  const validateSchema = data => Joi.assert(data, SCHEMA)

  const _create = data => Joi.attempt(data, SCHEMA)

  return {
    validateSchema,
  }

}()

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

  static getElementTypeInterface({ el }) {
    switch (el.elementTyp) {
      case EventDispatcher.ELEMENT_TYPE:
        return EventDispatchers
      case EventListener.ELEMENT_TYPE:
        return EventListeners
      case Flow.ELEMENT_TYPE:
        return Flows
      case Gateway.ELEMENT_TYPE:
        return Gateways
      case Phase.ELEMENT_TYPE:
        return Phases
      default:
        throw new Error(`Unknown element type ${el.elementType} provided`)
    }
  }

  static getElementById(workflow, id) {
    const collectionNames = Object.keys(workflow.elements)

    for (const col of collectionNames) {
      const el = workflow.elements[col].find(colEl => colEl.id === id)
      if (el) return el
    }
  }

  static get CONNECTION_MAP() {
    return {
      [EventDispatcher.ELEMENT_TYPE]: [],
      [EventListener.ELEMENT_TYPE]: [
        EventDispatcher.ELEMENT_TYPE,
        Gateway.ELEMENT_TYPE,
        Phase.ELEMENT_TYPE,
      ],
      [Gateway.ELEMENT_TYPE]: [
        EventDispatcher.ELEMENT_TYPE,
        Gateway.ELEMENT_TYPE,
        Phase.ELEMENT_TYPE,
      ],
      [Phase.ELEMENT_TYPE]: [],
    }
  }

  static validateConnect(workflow, srcId, destId) {
    const srcEl = Workflow.getElementById(workflow, srcId)
    const destEl = Workflow.getElementById(workflow, destId)

    if (!Workflow.CONNECTION_MAP[srcEl.elementType].includes(destEl.elementType)) {
      throw new ForbiddenConnectionError(
        `a(n) ${srcEl.elementType} cannot connect to a ${destEl.elementType}`,
        { srcEl, destEl },
      )
    }

    if (srcEl.type === AndMergeGateway.TYPE
      || srcEl.type === OrMergeGateway.TYPE) {
      const totalOutgoingFlows = Flows.getManyBy(workflow, { srcId })
      if (totalOutgoingFlows.length) {
        throw new IncorrectAmountOfOutgoingFlowsError(
          `Only one outgoing flow for ${srcEl.type} allowed`,
          { el: srcEl },
        )
      }
    }

    if (destEl.type === AndSplitGateway.TYPE
      || destEl.type === LoopGateway.TYPE
    ) {
      const totalIncomingFlows = Flows.getManyBy(workflow, { destId })
      if (totalIncomingFlows.length) {
        throw new IncorrectAmountOfIncomingFlowsError(
          `Only one incoming flow for ${destEl.type} allowed`,
          { el: destEl },
        )
      }
    }
  }

  static connect(workflow, srcId, destId) {
    Workflow.validateConnect(workflow, srcId, destId)
    return Flows.add(workflow, { srcId, destId })
  }

  static disconnect(workflow, flowId) {
    const flow = Flows.getById(workflow, flowId)
    const { srcId } = flow
    const srcEl = Workflow.getElementById(workflow, srcId)
    const workflowWithoutFlow = Flows.remove(workflow, flowId)

    if (!(srcEl.elementType === Gateway.ELEMENT_TYPE
      && srcEl.type === LoopGateway.TYPE && srcEl.loopbackFlowId === flowId)) {
      return workflowWithoutFlow
    }

    return Gateways.update(workflowWithoutFlow, srcId, { loopbackFlowId: null })
  }

  static connectGatewayLoopback(workflow, gatewayId, destId) {
    const el = Workflow.getElementById(workflow, gatewayId)

    if (el.elementType !== Gateway.ELEMENT_TYPE) {
      throw new IncorrectElementTypeError(`${el.elementType} is not a gateway`, { el })
    }

    if (el.type !== LoopGateway.TYPE) {
      throw new IncorrectElementTypeError(`gateway of type ${el.type} does not provide a loopback flow`, { el })
    }

    Workflow.validateConnect(workflow, gatewayId, destId)
    const wfWithFlow = Flows.add(workflow, { srcId: gatewayId, destId })
    const flows = Flows.getAll(wfWithFlow)
    const addedFlow = flows[flows.length - 1]

    return Gateways.update(wfWithFlow, gatewayId, { loopbackFlowId: addedFlow.id })
  }

  static removeAttachedElementFlows(workflow, id) {
    const flows = [
      ...Flows.getManyBy(workflow, { srcId: id }),
      ...Flows.getManyBy(workflow, { destId: id }),
    ]

    let newWf = workflow

    flows.forEach(flow => {
      newWf = Workflow.disconnect(newWf, flow.id)
    })

    return newWf
  }

  static removeElement(workflow, id) {
    const el = Workflow.getElementById(workflow, id)

    const wfWithoutFlow = Workflow.disconnect(workflow, id)
    if (el.ELEMENT_TYPE === Flow.ELEMENT_TYPE) return wfWithoutFlow
    return Workflow.removeAttachedElementFlows(workflow, id)
  }

  static createTemplate() {
    const id = uuid.v4()
    const workflow = Workflow._create({ version: Workflow.DEFAULT_VERSION, id })
    const withStartEvent = EventListeners.addStartEventListener(workflow)

    const withPhase = Phases.add(withStartEvent)

    const startEvent = EventListeners.getAll(withPhase)[0]
    const firstPhase = Phases.getAll(withPhase)[0]
    const withPhaseConnected = Workflow.connect(withPhase, startEvent.id, firstPhase.id)
    const withEndEventDispatcher = EventDispatchers.addEndEventDispatcher(withPhaseConnected)

    const withPhaseApprovalEvent = EventListeners
      .addApprovalEventListener(withEndEventDispatcher, { phaseId: firstPhase.id })
    const approvalEvent = EventListeners.getAll(withPhaseApprovalEvent)[1]
    const endDispatcherEvent = EventDispatchers.getAll(withPhaseApprovalEvent)[0]
    return Workflow.connect(withPhaseApprovalEvent, approvalEvent.id, endDispatcherEvent.id)
  }

}

module.exports = Workflow
