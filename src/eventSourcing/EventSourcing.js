const Event = require('./Event')
const Workflow = require('../workflow')

// Important: the event sourcing interface relies on the events being
// sorted by createdAt in ascending order!
// (otherwise every function that relies on the order would need to sort them
// which can result in a lot of redundant sorting)

const ACTIVATION_EVENTS = {
  [Workflow.EventListener.ELEMENT_TYPE]: Event.TYPES.EVENT_LISTENER_ACTIVATED,
  [Workflow.Flow.ELEMENT_TYPE]: Event.TYPES.FLOW_SIGNALED,
  [Workflow.Gateway.ELEMENT_TYPE]: Event.TYPES.GATEWAY_ACTIVATED,
  [Workflow.EventDispatcher.ELEMENT_TYPE]: Event.TYPES.DISPATCHED_EVENT,
  [Workflow.Phase.ELEMENT_TYPE]: Event.TYPES.PHASE_STARTED,
}

const ELEMENT_TYPE_TO_ID_KEY = {
  [Workflow.EventListener.ELEMENT_TYPE]: 'eventListenerId',
  [Workflow.Flow.ELEMENT_TYPE]: 'flowId',
  [Workflow.Gateway.ELEMENT_TYPE]: 'gatewayId',
  [Workflow.EventDispatcher.ELEMENT_TYPE]: 'eventDispatcherId',
  [Workflow.Phase.ELEMENT_TYPE]: 'phaseId',
}

const getEventsByType = (events, targetType) => (
  events.filter(({ type }) => type === targetType)
)

const getStartedEvent = events => (
  // This implementation could be dangerous - we are assuming the first "EVENT_RECEIVED"
  // event is the start event; This way we don't have to look up anything on workflow definition;
  // reality might show cases where this is not true even though I
  // coudn't come up with anything in my fantasy; then I suggest adding a "WORKFLOW_STARTED"
  // event type that is additionally dispatched by the start event listener
  events.find(({ type }) => (
    type === Event.TYPES.EVENT_RECEIVED
  ))
)

const getEndingEvent = events => (
  // a workflow can either be terminated (forcefully stopped) or finished (when running through)
  events.find(({ type }) => type === Event.TYPES.WORKFLOW_TERMINATED
    || type === Event.TYPES.WORKFLOW_FINISHED)
)

const getWorkflowDuration = events => {
  const startingEvent = getStartedEvent(events)
  if (!startingEvent) return 0

  const endingEvent = getEndingEvent(events)

  if (!endingEvent) {
    return Date.now() - startingEvent.createdAt
  }

  return endingEvent.createdAt - startingEvent.createdAt
}

const getActiveTarget = (wf, events, inputNodeId) => {
  // we need to find the latest phase that started and defines a command for the given
  // input node; because the first phase in a workflow should always define default inputs
  // for all targets, there should always be a result!
  const phaseStartedEvents = getEventsByType(events, Event.TYPES.PHASE_STARTED).reverse()

  for (const event of phaseStartedEvents) {
    const { data: { phaseId } } = event
    const targetValue = Workflow.getTargetValue(wf, phaseId, inputNodeId)

    if (targetValue !== undefined) return targetValue
  }
}

const getPhaseDuration = (wf, events, phaseId, occurenceIdx = 0) => {
  const phaseStartedEvents = events.filter(({ type, data }) => (
    type === Event.TYPES.PHASE_STARTED && data.phaseId === phaseId
  ))

  const phaseStartedEvent = phaseStartedEvents.length < (occurenceIdx + 1)
    ? null
    : phaseStartedEvents[occurenceIdx]

  if (!phaseStartedEvent) return 0

  // a phase can end in multiple ways:
  // 1. The process is finished after it
  // 2. One of its interrupting event listeners is triggered after it has started

  const listenerIds = Workflow.getPhaseEventListeners(wf, phaseId)
    .filter(el => el.interrupting === true)
    .map(listener => listener.id)

  const phaseEndingEvents = events.filter(({ type, data, createdAt }) => (
    (type === Event.EVENT_RECEIVED
      && listenerIds.includes(data.eventListenerId)
      && createdAt >= phaseStartedEvent.createdAt)
  ))

  const phaseEndingEvent = phaseEndingEvents.length < (occurenceIdx + 1)
    ? null
    : phaseEndingEvents[occurenceIdx]

  if (phaseEndingEvent) return phaseEndingEvent.createdAt - phaseStartedEvent.createdAt

  const processEndingEvent = getEndingEvent(wf, events)
  if (processEndingEvent) return processEndingEvent.createdAt - phaseStartedEvent.creaatedAt

  return Date.now() - phaseStartedEvent.createdAt
}

const getExecutedPhaseSequence = (wf, events) => (
  // this function does not consider that the phases might have been started
  // on different paths of the process, that means that the n+1th phase
  // might have been started while the nth phase is still running.
  // But it does mean that the n+1th phase commands
  // might have (partially overwritten) nth phase commands;
  // it is usefull to derive things like "which target was active at which time"
  getEventsByType(events, Event.TYPES.PHASE_STARTED)
    .map(({ data: { phaseId } }) => Workflow.getElementById(wf, phaseId))
)

const getActivationEventsForElement = (events, el) => {
  const { elementType, id } = el

  return getEventsByType(events, ACTIVATION_EVENTS[elementType])
    .filter(ev => ev.data[ELEMENT_TYPE_TO_ID_KEY[elementType]] === id)
}

const getElementTypeFromActivationEventType = eventType => (
  Object.entries(ACTIVATION_EVENTS).find(([_, value]) => value === eventType)[0]
)

const getElementForActivationEvent = (wf, event) => {
  const { data } = event
  const elementType = getElementTypeFromActivationEventType(event)

  return Workflow.getElementById(wf, data[ELEMENT_TYPE_TO_ID_KEY[elementType]])
}

const getEventsUntil = (events, timestamp) => (
  events.filter(event => event.createdAt <= timestamp)
)

const getActivationEvents = events => {
  const types = Object.values(ACTIVATION_EVENTS)
  return events.filter(ev => types.includes(ev.type))
}

const getActivatedElementsUntilElement = (wf, events, element, occurenceIdx = 0) => {
  // returns all workflow elements that were activated until the provided
  // element was activated for the n-th time;
  // might be usefull to highlight elements in the UI
  // when a process is running or an element in hovered
  const activationEvents = getActivationEvents(events)

  const elementActivationEvents = getActivationEventsForElement(activationEvents, element)
  if ((occurenceIdx + 1) > elementActivationEvents.length) return []

  const { createdAt } = elementActivationEvents[occurenceIdx]
  const relevantEvents = getEventsUntil(activationEvents, createdAt)

  const elements = relevantEvents.map(event => getElementForActivationEvent(wf, event))

  // because elements might be activated multiple times,
  // this contains duplicates; this might favourable, if you want
  // to know how many times an element was activated here (if not
  // wanted, just filter out duplicates)

  return elements
}

const getAllActivatedElements = (wf, events) => {
  const activationEvents = getActivationEvents(events)
  return activationEvents.map(event => getElementForActivationEvent(wf, event))
}

module.exports = {
  getEventsByType,
  getStartedEvent,
  getEndingEvent,
  getWorkflowDuration,
  getActiveTarget,
  getPhaseDuration,
  getExecutedPhaseSequence,
  getActivatedElementsUntilElement,
  getEventsUntil,
  getElementForActivationEvent,
  getAllActivatedElements,
}
