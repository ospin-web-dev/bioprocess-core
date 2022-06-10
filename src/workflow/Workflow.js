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
      elements: Joi.array()
        .items(Joi.alternatives().try(
          EndEventDispatcher.SCHEMA,
          ApprovalEventListener.SCHEMA,
          ConditionEventListener.SCHEMA,
          StartEventListener.SCHEMA,
          TimerEventListener.SCHEMA,
          AndMergeGateway.SCHEMA,
          AndSplitGateway.SCHEMA,
          LoopGateway.SCHEMA,
          OrMergeGateway.SCHEMA,
          Flow.SCHEMA,
          Phase.SCHEMA,
        )).default([]),
    })
  }

  static getElementById(workflow, id) {
    return workflow.elements.find(colEl => colEl.id === id)
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
        EventDispatcher.TYPE,
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

    if (srcEl.elementType === AndMergeGateway.ELEMENT_TYPE
      || srcEl.elementType === OrMergeGateway.ELEMENT_TYPE) {
      const totalIncomingFlows = Flows.getManyBy(workflow, { srcId })
      if (totalIncomingFlows.length) {
        throw new IncorrectAmountOfOutgoingFlowsError(
          `Only one outgoing flow for ${srcEl.type} allowed`,
          { el: srcEl },
        )
      }
    }

    if (destEl.elementType === AndSplitGateway.ELEMENT_TYPE
      || destEl.elementType === LoopGateway.ELEMENT_TYPE
    ) {
      const totalOutgoingFlows = Flows.getManyBy(workflow, { destId })
      if (totalOutgoingFlows.length) {
        throw new IncorrectAmountOfIncomingFlowsError(
          `Only one incoming flow for ${destEl.type} allowed`,
          { el: destEl },
        )
      }
    }
  }

  static connect(workflow, srcId, destId) {
    Workflow.validateConnect(workflow, srcId, destId)
    return Flows.addFlow(workflow, { srcId, destId })
  }

  static disconnect(workflow, flowId) {
    const flow = Flows.getById(workflow, flowId)
    const { srcId } = flow
    const srcEl = Workflow.getElementById(workflow, srcId)
    const workflowWithoutFlow = Flows.removeFlow(workflow, flowId)

    if (!(srcEl.elementType === Gateway.ELEMENT_TYPE
      && srcEl.type === LoopGateway.TYPE && srcEl.loopbackFlowId === flowId)) {
      return workflowWithoutFlow
    }

    return Gateways.updateGateway(workflowWithoutFlow, srcId, { loopbackFlowId: null })
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
    const wfWithFlow = Flows.addFlow(workflow, { srcId: gatewayId, destId })
    const flows = Flows.getAll(wfWithFlow)
    const addedFlow = flows[flows.length - 1]

    return Gateways.updateGateway(wfWithFlow, gatewayId, { loopbackFlowId: addedFlow.id })
  }

  static createTemplate() {
    const id = uuid.v4()
    const workflow = Workflow._create({ version: Workflow.DEFAULT_VERSION, id })
    const withStartEvent = EventListeners.addStartEventListener(workflow)

    const withPhase = Phases.addPhase(withStartEvent)

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
