const Joi = require('joi')

const EndEventDispatcher = require('./elements/eventDispatchers/EndEventDispatcher')

const ApprovalEventListener = require('./elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('./elements/eventListeners/ConditionEventListener')
const StartEventListener = require('./elements/eventListeners/StartEventListener')
const TimerEventListener = require('./elements/eventListeners/TimerEventListener')

const Flow = require('./elements/flows/Flow')

const AndMergeGateway = require('./elements/gateways/AndMergeGateway')
const AndSplitGateway = require('./elements/gateways/AndSplitGateway')
const LoopGateway = require('./elements/gateways/LoopGateway')
const OrSplitGateway = require('./elements/gateways/OrSplitGateway')

const Phase = require('./elements/phases/Phase')

class Workflow {

  static validateSchema(data) {
    Joi.assert(data, Workflow.SCHEMA)
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
          OrSplitGateway.SCHEMA,
        )).default([]),
        phases: Joi.array().items(Phase.SCHEMA).default([]),
      }),
    })
  }

  static getElementId(element) {
    return element.id
  }

  static getExistingIds(workflow) {
    const {
      elements: {
        eventDispatchers,
        eventListeners,
        flows,
        gateways,
        phases,
      },
    } = workflow

    return [
      ...eventDispatchers.map(Workflow.getElementId),
      ...eventListeners.map(Workflow.getElementId),
      ...flows.map(Workflow.getElementId),
      ...gateways.map(Workflow.getElementId),
      ...phases.map(Workflow.getElementId),
    ]
  }

  static get ID_PREFIXES() {
    return {
      EVENT_DISPATCHER: 'eventDispatcher',
      EVENT_LISTENER: 'eventListener',
      FLOW: 'flow',
      GATEWAY: 'gateway',
      PHASE: 'phase',
    }
  }

  static generateUniqueId(workflow, prefix = 'element') {
    const existingIds = Workflow.getExistingIds(workflow)
    let counter = 0
    let newId = `${prefix}_${counter}`

    while (existingIds.includes(newId)) {
      counter += 1
      newId = `${prefix}_${counter}`
    }

    return newId
  }

  static getElementById(elements, id) {
    return elements.find(el => e.id === id)
  }

  static addElement(elements, newElement) {
    return [ ...elements, newElement ]
  }

  static removeElement(elements, elementId) {
    return elements.filter(el => el.id !== elementId)
  }

  static updateElement(elements, updatedElement) {
    return elements.map(el => {
      if (el.id === updatedElement.id) {
        return updatedElement
      }
      return el
    })
  }

  /* EVENT DISPATCHERS */

  static get EVENT_DISPATCHER_TYPE_TO_API_MAP() {
    return {
      [EndEventDispatcher.TYPE]: EndEventDispatcher,
    }
  }

  static addEventDispatcher(workflow, api, data = {}) {
    const eventDispatcher = api.create({
      ...data,
      id: Workflow.generateUniqueId(workflow, Workflow.ID_PREFIXES.EVENT_DISPATCHER),
    })

    const eventDispatchers = Workflow
      .addElement(workflow.elements.eventDispatchers, eventDispatcher)

    return Workflow.updateEventDispatchers(workflow, eventDispatchers)
  }

  static updateEventDispatchers(workflow, eventDispatchers) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        eventDispatchers,
      },
    }
  }

  static removeEventDispatcher(workflow, eventDispatcherId) {
    const eventDispatchers = Workflow
      .removeElement(workflow.elements.eventDispatchers, eventDispatcherId)

    return Workflow.updateEventDispatchers(workflow, eventDispatchers)
  }

  static addEndEventDispatcher(workflow) {
    return Workflow.addEventDispatcher(workflow, EndEventDispatcher)
  }

  static updateEventDispatcher(workflow, id, data) {
    const eventDispatcher = Workflow.getElementById(workflow.elements.eventDispatchers, id)
    const updatedEventDispatcher = { ...eventDispatcher, ...data }

    const api = Workflow.EVENT_DISPATCHER_TYPE_TO_API_MAP[updatedEventDispatcher.type]
    api.validateData(updatedEventDispatcher)

    const eventDispatchers = Workflow.updateElement(workflow.elements.eventDispatchers, updatedEventDispatcher)

    return Workflow.updateEventDispatchers(workflow, eventDispatchers)
  }

  /* EVENT LISTENERS */

  static get EVENT_LISTENER_TYPE_TO_API_MAP() {
    return {
      [ApprovalEventListener.TYPE]: ApprovalEventListener,
      [ConditionEventListener.TYPE]: ConditionEventListener,
      [StartEventListener.TYPE]: StartEventListener,
      [TimerEventListener.TYPE]: TimerEventListener,
    }
  }

  static addEventListener(workflow, api, data = {}) {
    const eventListener = api.create({
      ...data,
      id: Workflow.generateUniqueId(workflow, Workflow.ID_PREFIXES.EVENT_LISTENER),
    })

    const eventListeners = Workflow.addElement(workflow.elements.eventListeners, eventListener)

    return Workflow.updateEventListeners(workflow, eventListeners)
  }

  static updateEventListeners(workflow, eventListeners) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        eventListeners,
      },
    }
  }

  static removeEventListener(workflow, eventListenerId) {
    const eventListeners = Workflow
      .removeElement(workflow.elements.eventListeners, eventListenerId)

    return Workflow.updateEventListeners(workflow, eventListeners)
  }

  static addApprovalEventListener(workflow, data) {
    return Workflow.addEventListener(workflow, ApprovalEventListener, data)
  }

  static addConditionEventListener(workflow, data) {
    return Workflow.addEventListener(workflow, ConditionEventListener, data)
  }

  static addStartEventListner(workflow, data) {
    return Workflow.addEventListener(workflow, StartEventListener, data)
  }

  static addTimerEventListener(workflow, data) {
    return Workflow.addEventListener(workflow, TimerEventListener, data)
  }

  static updateEventListener(workflow, id, data) {
    const eventListener = Workflow.getElementById(workflow.elements.eventListeners, id)
    const updatedEventListener = { ...eventListener, ...data }

    const api = Workflow.EVENT_LISTENER_TYPE_TO_API_MAP[updatedEventListener.type]
    api.validateData(updatedEventListener)

    const eventListeners = Workflow.updateElement(workflow.elements.eventListeners, updatedEventListener)

    return Workflow.updateEventListeners(workflow, eventListeners)
  }

  /* FLOWS */

  static addFlow(workflow, data = {}) {
    const flow = Flow.create({
      ...data,
      id: Workflow.generateUniqueId(workflow, Workflow.ID_PREFIXES.FLOW),
    })

    const flows = Workflow.addElement(workflow.elements.flows, flow)

    return Workflow.updateFlows(workflow, flows)
  }

  static updateFlows(workflow, flows) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        flows,
      },
    }
  }

  static removeFLow(workflow, flowId) {
    const flows = Workflow.removeElement(workflow.elements.flows, flowId)
    return Workflow.updateFlows(workflow, flows)
  }

  static updateEventFlow(workflow, id, data) {
    const flow = Workflow.getElementById(workflow.elements.flows, id)
    const updatedFlow = { ...flow, ...data }

    Flow.validateData(updatedFlow)

    const flows = Workflow.updateElement(workflow.elements.flows, updatedFlow)

    return Workflow.updateEventListeners(workflow, flows)
  }

  /* GATEWAYS */

  static get GATEWAY_TYPE_TO_API_MAP() {
    return {
      [AndMergeGateway.TYPE]: AndMergeGateway,
      [AndSplitGateway.TYPE]: AndSplitGateway,
      [LoopGateway.TYPE]: LoopGateway,
      [OrSplitGateway.TYPE]: OrSplitGateway,
    }
  }

  static addGateway(workflow, api, data = {}) {
    const gateway = api.create({
      ...data,
      id: Workflow.generateUniqueId(workflow, Workflow.ID_PREFIXES.GATEWAY),
    })

    const gateways = Workflow.addElement(workflow.elements.gateways, gateway)

    return Workflow.updateGateways(workflow, gateways)
  }

  static updateGateways(workflow, gateways) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        gateways,
      },
    }
  }

  static removeGateway(workflow, gatewayId) {
    const gateways = Workflow.removeElement(workflow.elements.gateways, gatewayId)
    return Workflow.updateGateways(workflow, gateways)
  }

  static addAndMergeGateway(workflow, data) {
    return Workflow.addGateway(workflow, AndMergeGateway, data)
  }

  static addAndSplitGateway(workflow, data) {
    return Workflow.addGateway(workflow, AndSplitGateway, data)
  }

  static addLoopGateway(workflow, data) {
    return Workflow.addGateway(workflow, LoopGateway, data)
  }

  static addOrSplitGateway(workflow, data) {
    return Workflow.addGateway(workflow, OrSplitGateway, data)
  }

  static updateGateway(workflow, id, data) {
    const gateway = Workflow.getElementById(workflow.elements.gateways, id)
    const updatedGateway = { ...gateway, ...data }

    const api = Workflow.GATEWAY_TYPE_TO_API_MAP[updatedGateway.type]
    api.validateData(updatedGateway)

    const gateways = Workflow.updateElement(workflow.elements.gateways, updatedGateway)

    return Workflow.updateEventListeners(workflow, gateways)
  }

  /* PHASES */

  static addPhase(workflow, data = {}) {
    const phase = Phase.create({
      ...data,
      id: Workflow.generateUniqueId(workflow, Workflow.ID_PREFIXES.GATEWAY),
    })

    const phases = Workflow.addElement(workflow.elements.phases, phase)

    return Workflow.updatePhases(workflow, phases)
  }

  static updatePhases(workflow, phases) {
    return {
      ...workflow,
      elements: {
        ...workflow.elements,
        phases,
      },
    }
  }

  static removePhase(workflow, phaseId) {
    const phases = Workflow.removeElement(workflow.elements.phases, phaseId)
    return Workflow.updatePhases(workflow, phases)
  }

  static updatePhase(workflow, id, data) {
    const phase = Workflow.getElementById(workflow.elements.phases, id)
    const updatedPhase = { ...phase, ...data }

    Phase.validateData(updatedPhase)

    const phases = Workflow.updateElement(workflow.elements.phases, updatedPhase)

    return Workflow.updateEventListeners(workflow, phases)
  }

}

module.exports = Workflow
