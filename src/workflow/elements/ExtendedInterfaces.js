/* Here we overwrite/add CRUD operations on the element interfaces whenever
 * we have to interact with other element groups
 */

const Flows = require('./flows/Flows')
const Phases = require('./phases/Phases')

const Gateways = require('./gateways/Gateways')
const AndGateway = require('./gateways/AndGateway')
const OrGateway = require('./gateways/OrGateway')
const ConditionalGateway = require('./gateways/ConditionalGateway')

const EventListeners = require('./eventListeners/EventListeners')
const ApprovalEventListener = require('./eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./eventListeners/ConditionEventListener')
const StartEventListener = require('./eventListeners/StartEventListener')
const TimerEventListener = require('./eventListeners/TimerEventListener')

const EventDispatchers = require('./eventDispatchers/EventDispatchers')
const EndEventDispatcher = require('./eventDispatchers/EndEventDispatcher')

const getElementById = require('../functions/getElementById')

const ForbiddenConnectionError = require('../errors/ForbiddenConnectionError')
const IncorrectAmountOfOutgoingFlowsError = require('../errors/IncorrectAmountOfOutgoingFlowsError')
const IncorrectElementTypeError = require('../errors/IncorrectElementTypeError')

const removeFlowReferenceFromGateway = flowRemoveFn => (workflow, flowId) => {
  /* whenever an outgoing flow of a ConditionalGateway is removed, unset the refs */
  const flow = Flows.getById(workflow, flowId)
  const workflowWithoutFlow = flowRemoveFn(workflow, flowId)

  const gatewayWithTrueFlowRef = Gateways.getBy(workflowWithoutFlow, { trueFlowId: flow.id })
  const gatewayWithFalseFlowRef = Gateways.getBy(workflowWithoutFlow, { falseFlowId: flow.id })

  if (!gatewayWithTrueFlowRef && !gatewayWithFalseFlowRef) {
    return workflowWithoutFlow
  }

  if (gatewayWithTrueFlowRef) {
    return ConditionalGateway
      .update(workflowWithoutFlow, gatewayWithTrueFlowRef.id, { trueFlowId: null })
  }

  return ConditionalGateway
    .update(workflowWithoutFlow, gatewayWithFalseFlowRef.id, { falseFlowId: null })
}

Flows.remove = removeFlowReferenceFromGateway(Flows.remove)

/* whenever a non-Flow element is removed, delete all associated flows */

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

const addRemoveAttachedFlowsHook = removeElementFn => (wf, elementId) => {
  const el = getElementById(wf, elementId)
  const wfWithoutElement = removeElementFn(wf, elementId)

  if (el.elementType === Flows.ELEMENT_TYPE) return wfWithoutElement
  return removeAttachedElementFlows(wfWithoutElement, elementId)
}

const interfacesWithPostRemovalFlowCleanup = [
  Phases,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  AndGateway,
  OrGateway,
  ConditionalGateway,
  EndEventDispatcher,
]

/* eslint-disable */
interfacesWithPostRemovalFlowCleanup.forEach(elemIf => {
  elemIf.remove = addRemoveAttachedFlowsHook(elemIf.remove)
})
/* eslint-enable */

/* validate connections are valid when creating flows */

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

const validateElementNotConnectingToItself = (srcEl, destEl) => {
  if (srcEl.id === destEl.id) {
    throw new ForbiddenConnectionError(
      'Cannot connect an element to itself',
      { srcEl, destEl },
    )
  }
}

const validateElementTypesCanConnect = (srcEl, destEl) => {
  if (!CONNECTION_MAP[srcEl.elementType].includes(destEl.elementType)) {
    throw new ForbiddenConnectionError(
      `a(n) ${srcEl.elementType} cannot connect to a ${destEl.elementType}`,
      { srcEl, destEl },
    )
  }
}

const validateElementsHaveOnlyOneOutgoingFlow = (wf, srcEl) => {
  if (srcEl.elementType === EventListeners.ELEMENT_TYPE) {
    const totalOutgoingFlows = Flows.getManyBy(wf, { srcId: srcEl.id })
    if (totalOutgoingFlows.length) {
      throw new IncorrectAmountOfOutgoingFlowsError(
        `Only one outgoing flow for ${srcEl.elementType} allowed`,
        { el: srcEl },
      )
    }
  }
}

const addFlowCreationValidation = flowAddFn => (workflow, { srcId, destId }) => {
  const srcEl = getElementById(workflow, srcId)
  const destEl = getElementById(workflow, destId)

  validateElementNotConnectingToItself(srcEl, destEl)
  validateElementTypesCanConnect(srcEl, destEl)
  validateElementsHaveOnlyOneOutgoingFlow(workflow, srcEl)

  return flowAddFn(workflow, { srcId, destId })
}

Flows.add = addFlowCreationValidation(Flows.add)

/* add methods to create the if-true and if-false flows for a conditional gateway */

const addFlowToConditionalGatewayReferenceHook = (flowAddFn, val) => (workflow, { srcId, destId }) => {
  const el = getElementById(workflow, srcId)

  if (el.elementType !== Gateways.ELEMENT_TYPE) {
    throw new IncorrectElementTypeError(`${el.elementType} is not a gateway`, { el })
  }

  if (el.type !== ConditionalGateway.TYPE) {
    throw new IncorrectElementTypeError(`gateway of type ${el.type} does not provide an if-${val} flow`, { el })
  }

  const wfWithFlow = flowAddFn(workflow, { srcId, destId })
  const flow = Flows.getLast(wfWithFlow)

  const data = val ? { trueFlowId: flow.id } : { falseFlowId: flow.id }
  return ConditionalGateway.update(wfWithFlow, srcId, data)
}

Flows.addTrueFlow = addFlowToConditionalGatewayReferenceHook(Flows.add, true)
Flows.addFalseFlow = addFlowToConditionalGatewayReferenceHook(Flows.add, false)

/* whenever we delete a phase, delete all associated event listeners */

const getEventListenerInterfaceFromType = listenerType => {
  switch (listenerType) {
    case ApprovalEventListener.TYPE:
      return ApprovalEventListener
    case ConditionEventListener.TYPE:
      return ConditionEventListener
    case StartEventListener.TYPE:
      return StartEventListener
    case TimerEventListener.TYPE:
      return TimerEventListener
    default:
      throw new Error('Unknown event listener type provided')
  }
}

const addRemoveAssociatedEventListenersHook = removePhaseFn => (wf, phaseId) => {
  let wfWithoutPhase = removePhaseFn(wf, phaseId)

  const eventListeners = EventListeners.getManyBy(wfWithoutPhase, { phaseId })

  if (eventListeners.length) {
    eventListeners.forEach(listener => {
      wfWithoutPhase = getEventListenerInterfaceFromType(listener.type)
        .remove(wfWithoutPhase, listener.id)
    })
  }

  return wfWithoutPhase
}

Phases.remove = addRemoveAssociatedEventListenersHook(Phases.remove)

module.exports = {
  Flows,
  Phases,
  Gateways,
  EventListeners,
  EventDispatchers,
  AndGateway,
  OrGateway,
  ConditionalGateway,
  ApprovalEventListener,
  ConditionEventListener,
  StartEventListener,
  TimerEventListener,
  EndEventDispatcher,
}
