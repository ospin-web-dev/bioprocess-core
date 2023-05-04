const Joi = require('joi')
const uuid = require('uuid')

const ForbiddenConnectionError = require('./errors/ForbiddenConnectionError')
const IncorrectAmountOfOutgoingFlowsError = require('./errors/IncorrectAmountOfOutgoingFlowsError')
const IncorrectAmountOfStartEventListenersError = require('./errors/IncorrectAmountOfStartEventListenersError')
const IncorrectElementTypeError = require('./errors/IncorrectElementTypeError')
const NoPhasesError = require('./errors/NoPhasesError')
const NoEndEventDispatcherError = require('./errors/NoEndEventDispatcherError')

const Phase = require('./elements/Phase')
const Gateway = require('./elements/Gateway')
const EventDispatcher = require('./elements/EventDispatcher')
const EventListener = require('./elements/EventListener')
const Flow = require('./elements/Flow')
const Command = require('./elements/Command')

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
    Phase.SCHEMA,
    Gateway.SCHEMA,
    EventListener.SCHEMA,
    EventDispatcher.SCHEMA,
    Flow.SCHEMA,
  )).default([]),
})

const create = initialData => Joi.attempt(initialData, SCHEMA)

const pipe = (functions, ...initParams) => (
  functions.reduce((res, fn, idx) => (idx > 0 ? fn(res) : fn(...res)), initParams)
)

const getElements = wf => wf.elements

const getManyElementsBy = (wf, query) => getElements(wf).filter(el => {
  const keys = Object.keys(query)
  return keys.every(key => el[key] === query[key])
})

const getElementBy = (wf, query) => getElements(wf).find(el => {
  const keys = Object.keys(query)
  return keys.every(key => el[key] === query[key])
})

const getElementById = (wf, id) => getElementBy(wf, { id })

const getPhases = wf => getManyElementsBy(wf, { elementType: Phase.ELEMENT_TYPE })

const getFlows = wf => getManyElementsBy(wf, { elementType: Flow.ELEMENT_TYPE })

const getGateways = wf => getManyElementsBy(wf, { elementType: Gateway.ELEMENT_TYPE })

const getEventListeners = wf => getManyElementsBy(wf, { elementType: EventListener.ELEMENT_TYPE })

const getPhaseEventListeners = (wf, phaseId) => getManyElementsBy(wf, {
  elementType: EventListener.ELEMENT_TYPE, phaseId })

const getGlobalEventListeners = wf => getPhaseEventListeners(wf, null)

const getStartEventListeners = wf => getManyElementsBy(wf, {
  elementType: EventListener.ELEMENT_TYPE, type: EventListener.TYPES.START })

const getEventDispatchers = wf => getManyElementsBy(wf, {
  elementType: EventDispatcher.ELEMENT_TYPE })

const getLastPhase = wf => {
  const phases = getPhases(wf)
  return phases[phases.length - 1]
}

const getLastFlow = wf => {
  const flows = getFlows(wf)
  return flows[flows.length - 1]
}

const getIncomingFlows = (wf, id) => (
  getManyElementsBy(wf, { elementType: Flow.ELEMENT_TYPE, destId: id })
)

const getOutgoingFlows = (wf, id) => (
  getManyElementsBy(wf, { elementType: Flow.ELEMENT_TYPE, srcId: id })
)

const getCommandByType = (wf, phaseId, commandType) => {
  const phase = getElementById(wf, phaseId)
  return phase.commands.find(command => command.type === commandType)
}

const getSetTargetsCommand = (wf, phaseId) => (
  getCommandByType(wf, phaseId, Command.TYPES.SET_TARGETS)
)

const getTargetValue = (wf, phaseId, inputNodeId) => {
  // important: phases might define target values only for a subset of slots, so
  // this function will only return a value if the phase defines a target;
  // when you are you interested in the currently active target value
  // of a workflow, you have to use the EventSourcing

  const existingSetTargetCommand = getSetTargetsCommand(wf, phaseId)

  if (!existingSetTargetCommand) return

  const targetEntry = existingSetTargetCommand.data.targets.find(target => (
    target.inputNodeId === inputNodeId
  ))

  if (targetEntry) return targetEntry.target
}

const getElementSchema = el => {
  const { elementType, type } = el
  if (type) {
    return ELEMENT_TYPE_SCHEMAS[elementType][type]
  }
  return ELEMENT_TYPE_SCHEMAS[elementType]
}

const updateElement = (wf, id, data) => {
  const el = getElementById(wf, id)
  const schema = getElementSchema(el)

  const updatedElement = { ...el, ...data }
  Joi.assert(updatedElement, schema)

  return {
    ...wf,
    elements: wf.elements.map(aEl => (aEl.id === id ? updatedElement : aEl)),
  }
}

const updateCommand = (wf, phaseId, updatedCommand) => {
  const phase = getElementById(wf, phaseId)
  const updatedCommands = phase.commands.map(command => {
    if (command.id === updatedCommand.id) return updatedCommand
    return command
  })
  return updateElement(wf, phaseId, { commands: updatedCommands })
}

const updateSetTargetsCommand = (wf, phaseId, inputNodeId, value) => {
  const command = getSetTargetsCommand(wf, phaseId)

  const existingTargetValue = command.data.targets
    .some(target => target.inputNodeId === inputNodeId)

  const updatedTargets = existingTargetValue
    ? command.data.targets.map(target => {
      if (target.inputNodeId === inputNodeId) {
        return { ...target, target: value }
      }
      return target
    })
    : [ ...command.data.targets, { inputNodeId, target: value } ]

  const updatedCommand = {
    ...command,
    data: {
      ...command.data,
      targets: updatedTargets,
    },
  }

  return updateCommand(wf, phaseId, updatedCommand)
}

const addElement = (wf, data, schema) => {
  const dataWithId = { ...data, id: uuid.v4() }
  const validatedData = Joi.attempt(dataWithId, schema)
  return {
    ...wf,
    elements: [ ...wf.elements, validatedData ],
  }
}

const addPhase = (wf, data) => {
  const dataWithElementType = { ...data, elementType: Phase.ELEMENT_TYPE }
  return addElement(wf, dataWithElementType, Phase.SCHEMA)
}

const addSetTargetCommand = (wf, phaseId) => {
  const phase = getElementById(wf, phaseId)

  const data = Joi.attempt({
    id: uuid.v4(),
    type: Command.TYPES.SET_TARGETS,
  }, Command.SCHEMA)

  return updateElement(wf, phaseId, { commands: [ ...phase.commands, data ] })
}

const setTargetValue = (wf, phaseId, inputNodeId, value) => {
  const existingSetTargetCommand = getSetTargetsCommand(wf, phaseId)

  if (!existingSetTargetCommand) {
    return updateSetTargetsCommand(
      addSetTargetCommand(wf, phaseId),
      phaseId,
      inputNodeId,
      value,
    )
  }

  return updateSetTargetsCommand(wf, phaseId, inputNodeId, value)
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
  [EventDispatcher.ELEMENT_TYPE]: [],
  [EventListener.ELEMENT_TYPE]: [
    EventDispatcher.ELEMENT_TYPE,
    Gateway.ELEMENT_TYPE,
    Phase.ELEMENT_TYPE,
  ],
  [Gateway.ELEMENT_TYPE]: [
    EventListener.ELEMENT_TYPE,
    EventDispatcher.ELEMENT_TYPE,
    Gateway.ELEMENT_TYPE,
    Phase.ELEMENT_TYPE,
  ],
  [Phase.ELEMENT_TYPE]: [],
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
  if (srcEl.elementType !== EventListener.ELEMENT_TYPE) {
    return
  }

  const totalOutgoingFlows = getOutgoingFlows(wf, srcEl.id)
  if (totalOutgoingFlows.length) {
    throw new IncorrectAmountOfOutgoingFlowsError(
      `Only one outgoing flow for ${srcEl.elementType} allowed`,
      { el: srcEl },
    )
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
  return addElement(wf, dataWithElementType, Flow.SCHEMA)
}

const addFlowToConditionalGateway = (workflow, flowData, val) => {
  const { srcId } = flowData
  const el = getElementById(workflow, srcId)

  if (el.elementType !== Gateway.ELEMENT_TYPE) {
    throw new IncorrectElementTypeError(`${el.elementType} is not a gateway`, { el })
  }

  if (el.type !== Gateway.TYPES.CONDITIONAL) {
    throw new IncorrectElementTypeError(`gateway of type ${el.type} does not provide an if-${val} flow`, { el })
  }

  const wfWithFlow = addFlow(workflow, flowData)
  const flow = getLastFlow(wfWithFlow)

  const data = val ? { trueFlowId: flow.id } : { falseFlowId: flow.id }
  return updateElement(wfWithFlow, srcId, data)
}

const addTrueFlow = (wf, data) => addFlowToConditionalGateway(wf, data, true)
const addFalseFlow = (wf, data) => addFlowToConditionalGateway(wf, data, false)

const addGateway = (wf, data, schema) => {
  const dataWithElementType = { ...data, elementType: Gateway.ELEMENT_TYPE }
  return addElement(wf, dataWithElementType, schema)
}

const addAndGateway = (wf, data) => {
  const dataWithGatewayType = { ...data, type: Gateway.TYPES.AND }
  const schema = Gateway.TYPES_TO_SCHEMA[Gateway.TYPES.AND]
  return addGateway(wf, dataWithGatewayType, schema)
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
  return addElement(wf, dataWithElementType, schema)
}

const addStartEventListener = (wf, data) => {
  const startListeners = getStartEventListeners(wf)
  if (startListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()

  const dataWithListenerType = { ...data, type: EventListener.TYPES.START }
  const schema = EventListener.TYPES_TO_SCHEMA[EventListener.TYPES.START]
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
  return addElement(wf, dataWithElementType, schema)
}

const addEndEventDispatcher = (wf, data) => {
  const dataWithDispatcherType = { ...data, type: EventDispatcher.TYPES.END }
  const schema = EventDispatcher.TYPES_TO_SCHEMA[EventDispatcher.TYPES.END]
  return addEventDispatcher(wf, dataWithDispatcherType, schema)
}

const addAlertEventDispatcher = (wf, data) => {
  const dataWithDispatcherType = { ...data, type: EventDispatcher.TYPES.ALERT }
  const schema = EventDispatcher.TYPES_TO_SCHEMA[EventDispatcher.TYPES.ALERT]
  return addEventDispatcher(wf, dataWithDispatcherType, schema)
}

const removeElementsById = (wf, ids) => ({
  ...wf,
  elements: wf.elements.filter(el => !ids.includes(el.id)),
})

const removeFlow = (wf, id) => {
  const flow = getElementById(wf, id)
  const workflowWithoutFlow = removeElementsById(wf, [id])

  const gatewayWithTrueFlowRef = getElementBy(workflowWithoutFlow, {
    trueFlowId: flow.id,
    type: Gateway.TYPES.CONDITIONAL,
  })

  if (gatewayWithTrueFlowRef) {
    return updateElement(workflowWithoutFlow, gatewayWithTrueFlowRef.id, { trueFlowId: null })
  }

  const gatewayWithFalseFlowRef = getElementBy(workflowWithoutFlow, {
    falseFlowId: flow.id,
    type: Gateway.TYPES.CONDITIONAL,
  })

  if (gatewayWithFalseFlowRef) {
    return updateElement(workflowWithoutFlow, gatewayWithFalseFlowRef.id, { falseFlowId: null })
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
    const totalPhases = getPhases(wf)

    if (totalPhases.length) {
      throw new NoPhasesError()
    }

    const els = getEventListeners(wf)
      .filter(el => el.phaseId === elToDelete.id)

    els.forEach(el => {
      getIncomingFlows(wf, el.id)
        .forEach(flow => idsToDelete.push(flow.id))
      getOutgoingFlows(wf, el.id)
        .forEach(flow => idsToDelete.push(flow.id))
    })

    els.forEach(el => idsToDelete.push(el.id))
  }

  if (elToDelete.elementType === EventDispatcher.ELEMENT_TYPE
    && elToDelete.type === EventDispatcher.TYPES.END) {
    const endDispatchers = getManyElementsBy(wf, {
      elementType: EventDispatcher.ELEMENT_TYPE,
      type: EventDispatcher.TYPES.END,
    })

    if (endDispatchers.length === 1) {
      throw new NoEndEventDispatcherError()
    }
  }

  if (elToDelete.elementType === EventListener.ELEMENT_TYPE
    && elToDelete.type === EventListener.TYPES.START) {
    const startListeners = getStartEventListeners(wf)

    if (startListeners.length === 1) {
      throw new IncorrectAmountOfStartEventListenersError()
    }
  }

  return removeElementsById(wf, idsToDelete)
}

const removeSetTargetsCommand = (wf, phaseId) => {
  const phase = getElementById(wf, phaseId)

  return updateElement(wf, phaseId, {
    commands: phase.commands.filter(com => com.type === Command.TYPES.SET_TARGETS),
  })
}

const removeTargetValue = (wf, phaseId, inputNodeId) => {
  const command = getSetTargetsCommand(wf, phaseId)

  const updatedCommand = {
    ...command,
    data: {
      ...command.data,
      targets: command.data.targets.filter(target => target.inputNodeId !== inputNodeId),
    },
  }

  return updateCommand(wf, phaseId, updatedCommand)
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

  const gatewayCondition = getGateways(wf)
    .filter(gw => gw.type === Gateway.TYPES.OR || gw.type === Gateway.TYPES.AND)
    .map(gw => getOutgoingFlows(wf, gw.id).length)
    .some(totalOutFlows => totalOutFlows > 1)
  if (gatewayCondition) return false

  const nonInterruptingEventListenersCondition = getManyElementsBy(wf, {
    interrupting: false,
    elementType: EventListener.ELEMENT_TYPE,
  }).some(el => el.phase !== null)
  if (nonInterruptingEventListenersCondition) return false

  const globalEventListenerCondition = getGlobalEventListeners(wf, { phaseId: null })
    .filter(el => el.type !== EventListener.TYPES.START)
    .map(el => getIncomingFlows(wf, el.id).length)
    .some(totalInflows => totalInflows === 0)
  if (globalEventListenerCondition) return false

  return true
}

const isLinear = wf => {
  // a linear process is single threaded and every phase has only one event listener
  const singleThreaded = isSingleThreaded(wf)
  if (!singleThreaded) return false

  return getPhases(wf).every(phase => getPhaseEventListeners(wf, phase.id).length <= 1)
}

const createTemplate = () => {
  // @desc creates an empty workflow with the minimum required setup, including a START event
  // listener, a single phase, an APPROVAL event listener within the phase and an END dispatcher
  const id = uuid.v4()

  return pipe([
    create,
    addStartEventListener,
    addPhase,
    wf => addFlow(wf, {
      srcId: getEventListeners(wf)[0].id,
      destId: getLastPhase(wf).id,
    }),
    addEndEventDispatcher,
    wf => addApprovalEventListener(wf, { phaseId: getLastPhase(wf).id }),
    wf => addFlow(wf, {
      srcId: getElementBy(wf, {
        elementType: EventListener.ELEMENT_TYPE,
        type: EventListener.TYPES.APPROVAL,
      }).id,
      destId: getEventDispatchers(wf)[0].id,
    }),
  ], { id })

}

module.exports = {
  create,
  pipe,

  getElements,
  getManyElementsBy,
  getElementBy,
  getElementById,
  getPhases,
  getFlows,
  getGateways,
  getEventListeners,
  getPhaseEventListeners,
  getGlobalEventListeners,
  getStartEventListeners,
  getEventDispatchers,
  getLastPhase,
  getLastFlow,
  getIncomingFlows,
  getOutgoingFlows,
  getSetTargetsCommand,

  getTargetValue,
  setTargetValue,
  removeTargetValue,

  updateElement,

  addPhase,
  addSetTargetCommand,

  addFlow,
  addTrueFlow,
  addFalseFlow,

  addAndGateway,
  addOrGateway,
  addConditionalGateway,

  addStartEventListener,
  addConditionEventListener,
  addApprovalEventListener,
  addTimerEventListener,

  addEndEventDispatcher,
  addAlertEventDispatcher,

  removeElementsById,
  removeFlow,
  removeElement,
  removeSetTargetsCommand,

  isSingleThreaded,
  isLinear,
  createTemplate,
  validateSchema: data => Joi.assert(data, SCHEMA),

  Phase,
  Flow,
  Gateway,
  EventListener,
  EventDispatcher,
  Command,
}
