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

const ForbiddenConnectionError = require('./errors/ForbiddenConnectionError')
const IncorrectAmountOfOutgoingFlowsError = require('./errors/IncorrectAmountOfOutgoingFlowsError')
const IncorrectElementTypeError = require('./errors/IncorrectElementTypeError')

const Phase = {
  ELEMENT_TYPE: 'PHASE',
}

const ELEMENT_TYPE_SCHEMAS = {
  [Phase.ELEMENT_TYPE]: Phase.SCHEMA,
  [Flow.ELEMENT_TYPE]: Flow.SCHEMA,
  [Gateway.ELEMENT_TYPE]: Gateway.TYPES_TO_SCHEMA,
  [EventListener.ELEMENT_TYPE]: EventListener.TYPES_TO_SCHEMA,
  [EventDispatcher.ELEMENT_TYPE]: EventDispatcher.TYPES_TO_SCHEMA,
}

const SCHEMA = Joi.object({
  id: Joi.string().required(),
  version: Joi.string().default('1.0'),
  elements: Joi.array().items(Joi.alternatives().try(
    EndEventDispatcher.SCHEMA,
    AlertEventDispatcher.SCHEMA,
    ApprovalEventListener.SCHEMA,
    ConditionEventListener.SCHEMA,
    StartEventListener.SCHEMA,
    TimerEventListener.SCHEMA,
    Flows.SCHEMA,
    AndGateway.SCHEMA,
    OrGateway.SCHEMA,
    ConditionalGateway.SCHEMA,
    Phases.SCHEMA,
  )).default([]),
})

/**
 * @function create
 * @memberof Workflow
 * @arg {Object} initialData={}
 * @desc creates a new workflow with the passed data.
 * <strong>It is recommended to use createTemplate instead</strong>
 */

const create = initialData => Joi.attempt(initialData, SCHEMA)

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

const getElements = wf => wf.elements

const getElementBy = (wf, query) => getElements(wf).find(el => {
  const keys = Object.keys(query)
  return keys.every(key => el[key] === query[key])
})

const getElementById = (wf, id) => getElementBy(wf, { id })

const getManyElementsBy = (wf, query) => getElements(wf).filter(el => {
  const keys = Object.keys(query)
  return keys.every(key => el[key] === query[key])
})

const getPhases = wf => getManyElementsBy(wf, { elementType: Phase.ELEMENT_TYPE })

const getFlows = wf => getManyElementsBy(wf, { elementType: Flow.ELEMENT_TYPE })

const getGateways = wf => getManyElementsBy(wf, { elementType: Gateway.ELEMENT_TYPE })

const getEventListeners = wf => getManyElementsBy(wf, { elementType: EventListener.ELEMENT_TYPE })

const getEventDispatchers = wf => getManyElementsBy(wf, { elementType: EventDispatcher.ELEMENT_TYPE })

const getLastPhase = wf => {
  const phases = getPhases(wf)
  return phases[phases.length - 1]
}

const getIncomingFlows = (wf, id) => (
  getManyElementsBy({ elementType: Flow.ELEMENT_TYPE, destId: id })
)

const getOutgoingFlows = (wf, id) => (
  getManyElementsBy({ elementType: Flow.ELEMENT_TYPE, srcId: id })
)

const getCommandByType = (wf, phaseId, commandType) => {
  const phase = getElementById(wf, phaseId)
  return phase.commands.find(command => command.type === commandType)
}

const getTargetValue = (wf, phaseId, inputNodeId) => {
  const existingSetTargetCommand = getCommandByType(wf, phaseId, Command.TYPES.SET_TARGETS)

  if (!existingSetTargetCommand) return

  const targetEntry = existingSetTargetCommand.data.targets.find(target => (
    target.inputNodeId === inputNodeId
  ))

  if (targetEntry) return targetEntry.target
}

// ADDING ELEMENTS

const addElement = (wf, data, schema) => {
  const dataWithId = { ...data, id: uuid.v4() }
  const validatedData = Joi.attempt(dataWithId, schema)
  return {
    ...wf,
    validatedData,
  }
}

const addPhase = (wf, data) => {
  const dataWithElementType = { ...data, elementType: Phase.ELEMENT_TYPE }
  addElement(wf, dataWithElementType, Phases.SCHEMA)
}

const validateElementNotConnectingToItself = (srcEl, destEl) => {
  if (srcEl.id === destEl.id) {
    throw new ForbiddenConnectionError(
      'Cannot connect an element to itself',
      { srcEl, destEl },
    )
  }
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

const addFlow = (wf, data) => {
  const { srcId, destId } = data
  const srcEl = getElementById(wf, srcId)
  const destEl = getElementById(wf, destId)

  validateElementNotConnectingToItself(srcEl, destEl)
  validateElementTypesCanConnect(srcEl, destEl)
  validateElementsHaveOnlyOneOutgoingFlow(wf, srcEl)

  const dataWithElementType = { ...data, elementType: Flow.ELEMENT_TYPE }
  addElement(wf, dataWithElementType, Flows.SCHEMA)
}

const addFlowToConditionalGateway = (workflow, flowData, val) => {
  const { srcId } = flowData
  const el = getElementById(workflow, srcId)

  if (el.elementType !== Gateways.ELEMENT_TYPE) {
    throw new IncorrectElementTypeError(`${el.elementType} is not a gateway`, { el })
  }

  if (el.type !== Gateway.TYPES.CONDITIONAL) {
    throw new IncorrectElementTypeError(`gateway of type ${el.type} does not provide an if-${val} flow`, { el })
  }

  const wfWithFlow = addFlow(workflow, flowData)
  const flow = Flows.getLast(wfWithFlow)

  const data = val ? { trueFlowId: flow.id } : { falseFlowId: flow.id }
  return ConditionalGateway.update(wfWithFlow, srcId, data)
}

const addTrueFlow = (wf, data) => addFlowToConditionalGateway(wf, data, true)
const addFalseFlow = (wf, data) => addFlowToConditionalGateway(wf, data, false)

const addGateway = (wf, data, schema) => {
  const dataWithElementType = { ...data, elementType: Gateway.ELEMENT_TYPE }
  addElement(wf, dataWithElementType, schema)
}

const addAndGateway = (wf, data) => {
  const dataWithGatewayType = { ...data, type: Gateway.TYPES.AND }
  const schema = Gateway.TYPES_TO_SCHEMA[Gateway.TYPES.AND]
  return addGateway(wf, data, schema)
}

const addOrGateway = (wf, data) => {
  const dataWithGatewayType = { ...data, type: Gateway.TYPES.OR }
  const schema = Gateway.TYPES_TO_SCHEMA[Gateway.TYPES.OR]
  return addGateway(wf, dataWithGatewayType, schema)
}

const addConditionalGateway = (wf, data) => {
  const dataWithGatewayType = { ...data, type: Gateway.TYPES.CONDITIONAL }
  const schema = Gateway.TYPES_TO_SCHEMA[Gateway.TYPES.CONDITIONAL]
  return addGateway(wf, dataWithGatewayType, schema)
}

const addEventListener = (wf, data, schema) => {
  const dataWithElementType = { ...data, elementType: EventListener.ELEMENT_TYPE }
  addElement(wf, dataWithElementType, schema)
}

const addStartEventListener = (wf, data) => {
  const dataWithListenerType = { ...data, type: EventListener.TYPES.START }
  const schema = Gateway.TYPES_TO_SCHEMA[EventListener.TYPES.START]
  return addEventListener(wf, dataWithListenerType, schema)
}

const addConditionEventListener = (wf, data) => {
  const dataWithListenerType = { ...data, type: EventListener.TYPES.CONDITION }
  const schema = EventListener.TYPES_TO_SCHEMA[EventListener.TYPES.CONDITION]
  return addEventListener(wf, dataWithListenerType, schema)
}

const addApprovalEventListener = (wf, data) => {
  const dataWithListenerType = { ...data, type: EventListener.TYPES.APPROVAL }
  const schema = EventListener.TYPES_TO_SCHEMA[EventListener.TYPES.APPROVAL]
  return addEventListener(wf, dataWithListenerType, schema)
}

const addTimerEventListener = (wf, data) => {
  const dataWithListenerType = { ...data, type: EventListener.TYPES.TIMER }
  const schema = EventListener.TYPES_TO_SCHEMA[EventListener.TYPES.TIMER]
  return addEventListener(wf, dataWithListenerType, schema)
}

const addEventDispatcher = (wf, data, schema) => {
  const dataWithElementType = { ...data, elementType: EventDispatcher.ELEMENT_TYPE }
  addElement(wf, dataWithElementType, schema)
}

const addEndEventDispatcher = (wf, data) => {
  const dataWithDispatcherType = { ...data, type: EventDispatcher.TYPES.END }
  const schema = EventDispatcher.TYPES_TO_SCHEMA[EventDispatcher.TYPES.END]
  return addEventListener(wf, dataWithDispatcherType, schema)
}

const addAlertEventDispatcher = (wf, data) => {
  const dataWithDispatcherType = { ...data, type: EventDispatcher.TYPES.ALERT }
  const schema = EventDispatcher.TYPES_TO_SCHEMA[EventDispatcher.TYPES.ALERT]
  return addEventListener(wf, dataWithDispatcherType, schema)
}

// removal

const removeElementsById = (wf, ids) => {
  return {
    ...wf,
    elements: wf.elements.filter(el => !ids.includes(el.id)),
  }
}

const removeFlow = (wf, id) => {
  const flow = getElementById(wf, id)
  const workflowWithoutFlow = removeElementsById(wf, [id])

  const gatewayWithTrueFlowRef = getElementBy(workflowWithoutFlow, {
    trueFlowId: flow.id,
    type: Gateway.TYPES.CONDITIONAL,
  })

  if (gatewayWithTrueFlowRef) {
    return ConditionalGateway
      .update(workflowWithoutFlow, gatewayWithTrueFlowRef.id, { trueFlowId: null })
  }

  const gatewayWithFalseFlowRef = getElementBy(workflowWithoutFlow, {
    falseFlowId: flow.id,
    type: Gateway.TYPES.CONDITIONAL,
  })

  if (gatewayWithFalseFlowRef) {
    return ConditionalGateway
      .update(workflowWithoutFlow, gatewayWithFalseFlowRef.id, { falseFlowId: null })
  }

  return workflowWithoutFlow
}

const removeElement = (wf, id) => {
  const elToDelete = getElementById(wf, id)
  if (!elToDelete) return wf

  const idsToDelete = [elToDelete.id]

  getIncomingFlows(wf, id)
    .forEach(flow => idsToDelete.push(flow.id))
  getOutgoingFlows(wf, id)
    .forEach(flow => idsToDelete.push(flow.id))

  if (elToDelete.elementType === Phase.ELEMENT_TYPE) {
    getEventListeners(wf)
      .filter(el => el.phaseId === elToDelete.id)
      .forEach(el => idsToDelete.push(el.id))
  }

  return removeElementsById(wf, idsToDelete)
}

const getElementSchema = el => {
  const { elementType, type } = el
  if (type) {
    return ELEMENT_TYPE_SCHEMAS[elementType][type]
  }
  return ELEMENT_TYPE_SCHEMAS[elementType]
}

const updateElement = (wf, id, data) => {
  const el = getElementBy(wf, id)
  const schema = getElementSchema(el)

  const updatedElement = { ...el, ...data }
  Joi.assert(updatedElement, schema)

  return {
    ...wf,
    elements: wf.elements.map(aEl => (aEl.id === id ? updatedElement : aEl)),
  }
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

  addPhase,
  addFlow,
  addGateway,
  addEventListener,
  addEventDispatcher,

  pipe,
  validateSchema: data => Joi.assert(data, SCHEMA),
  getElementById,
  createTemplate,
  create,
  isSingleThreaded,
  isLinear,

}
