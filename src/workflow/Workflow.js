const Joi = require('joi')
const uuid = require('uuid')

const EventDispatchers = require('./elements/eventDispatchers/EventDispatchers')
const EndEventDispatcher = require('./elements/eventDispatchers/EndEventDispatcher')

const EventListeners = require('./elements/eventListeners/EventListeners')
const ApprovalEventListener = require('./elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./elements/eventListeners/ConditionEventListener')
const StartEventListener = require('./elements/eventListeners/StartEventListener')
const TimerEventListener = require('./elements/eventListeners/TimerEventListener')

const Flows = require('./elements/flows/Flows')

const Gateways = require('./elements/gateways/Gateways')
const AndMergeGateway = require('./elements/gateways/AndMergeGateway')
const AndSplitGateway = require('./elements/gateways/AndSplitGateway')
const LoopGateway = require('./elements/gateways/LoopGateway')
const OrMergeGateway = require('./elements/gateways/OrMergeGateway')

const Phases = require('./elements/phases/Phases')

const ForbiddenConnectionError = require('./validator/errors/ForbiddenConnectionError')
const IncorrectAmountOfOutgoingFlowsError = require('./validator/errors/IncorrectAmountOfOutgoingFlowsError')
const IncorrectAmountOfIncomingFlowsError = require('./validator/errors/IncorrectAmountOfIncomingFlowsError')
const IncorrectElementTypeError = require('./validator/errors/IncorrectElementTypeError')

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

const validateSchema = data => Joi.assert(data, SCHEMA)

const create = data => Joi.attempt(data, SCHEMA)

const getElementById = (wf, id) => {
  const collectionNames = Object.keys(wf.elements)

  for (const col of collectionNames) {
    const el = wf.elements[col].find(colEl => colEl.id === id)
    if (el) return el
  }
}

const addLoopback = (workflow, { srcId, destId }) => {
  const wfWithFlow = Flows.add(workflow, { srcId, destId })
  const flow = Flows.getLast(wfWithFlow)

  const gateway = Gateways.findBy(wfWithFlow, { id: srcId })
  return Gateways.update(wfWithFlow, srcId, { loopbackFlowId: flow.id })
}

const removeLoopback = flowRemoveFn => (workflow, flowId) => {
  const flow = Flows.getById(workflow, flowId)
  const workflowWithoutFlow = flowRemoveFn(workflow, flowId)

  const gateway = Gateways.findBy(workflowWithoutFlow, { loopbackFlowId: flow.id })

  if (!gateway) {
    return workflowWithoutFlow
  }

  return Gateways.update(workflowWithoutFlow, gateway.id, { loopbackFlowId: null })
}

const removeAttachedElementFlows = (workflow, id) => {
  const flows = [
    ...Flows.getManyBy(workflow, { srcId: id }),
    ...Flows.getManyBy(workflow, { destId: id }),
  ]

  let newWf = workflow

  flows.forEach(flow => {
    newWf = Flows.remove(newWf, flow.id)
  })

  return newWf
}

const addRemoveFlowsHook = removeElementFn => (wf, elementId) => {
  const el = getElementById(wf, elementId)
  const wfWithoutElement = removeElementFn(wf, elementId)

  if (el.elementType === Flows.ELEMENT_TYPE) return wfWithoutElement
  return removeAttachedElementFlows(wf, elementId)
}

const CONNECTION_MAP = {
  [EventDispatchers.ELEMENT_TYPE]: [],
  [EventListeners.ELEMENT_TYPE]: [
    EventDispatchers.ELEMENT_TYPE,
    Gateways.ELEMENT_TYPE,
    Phases.ELEMENT_TYPE,
  ],
  [Gateways.ELEMENT_TYPE]: [
    EventDispatchers.ELEMENT_TYPE,
    Gateways.ELEMENT_TYPE,
    Phases.ELEMENT_TYPE,
  ],
  [Phases.ELEMENT_TYPE]: [],
}

const validateConnect = (workflow, srcId, destId) => {
  const srcEl = getElementById(workflow, srcId)
  const destEl = getElementById(workflow, destId)

  if (!CONNECTION_MAP[srcEl.elementType].includes(destEl.elementType)) {
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

const connect = (workflow, srcId, destId) => {
  validateConnect(workflow, srcId, destId)
  return Flows.add(workflow, { srcId, destId })
}


const connectGatewayLoopback = (workflow, gatewayId, destId) => {
  const el = getElementById(workflow, gatewayId)

  if (el.elementType !== Gateways.ELEMENT_TYPE) {
    throw new IncorrectElementTypeError(`${el.elementType} is not a gateway`, { el })
  }

  if (el.type !== LoopGateway.TYPE) {
    throw new IncorrectElementTypeError(`gateway of type ${el.type} does not provide a loopback flow`, { el })
  }

  validateConnect(workflow, gatewayId, destId)
  const wfWithFlow = Flows.add(workflow, { srcId: gatewayId, destId })
  const flows = Flows.getAll(wfWithFlow)
  const addedFlow = flows[flows.length - 1]

  return Gateways.update(wfWithFlow, gatewayId, { loopbackFlowId: addedFlow.id })
}


const createTemplate = () => {
  const id = uuid.v4()
  const workflow = create({ id })
  const withStartEvent = StartEventListener.add(workflow)

  const withPhase = Phases.add(withStartEvent)

  const startEvent = EventListeners.getAll(withPhase)[0]
  const firstPhase = Phases.getAll(withPhase)[0]
  const withPhaseConnected = connect(withPhase, startEvent.id, firstPhase.id)
  const withEndEventDispatcher = EndEventDispatcher.add(withPhaseConnected)

  const withPhaseApprovalEvent = ApprovalEventListener
    .add(withEndEventDispatcher, { phaseId: firstPhase.id })
  const approvalEvent = EventListeners.getAll(withPhaseApprovalEvent)[1]
  const endDispatcherEvent = EventDispatchers.getAll(withPhaseApprovalEvent)[0]
  return connect(withPhaseApprovalEvent, approvalEvent.id, endDispatcherEvent.id)
}

module.exports = {
  validateSchema,
  getElementById,
  connect,
  connectGatewayLoopback,
  createTemplate,
  create,
}
