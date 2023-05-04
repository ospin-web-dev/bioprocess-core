const Event = require('./Event')
const {
  EventListeners,
  Phases,
  Gateways,
  Flows,
} = require('../workflow')

// Important: the event sourcing interface relies on the events being
// sorted by createdAt in ascending order!
// (otherwise every function that relies on the order would need to sort them
// which can result in a lot of redundant sorting)

const getEventsByType = (events, targetType) => (
  events.filter(({ type }) => type === targetType)
)

const getStartedEvent = (wf, events) => {
  const el = EventListeners
    .getBy(wf, { type: EventListeners.TYPES.START })

  return events.find(({ type, data }) => (
    type === Event.TYPES.EVENT_RECEIVED && data.eventListenerId === el.id
  ))
}

const getEndingEvent = (wf, events) => (
  // a workflow can either be terminated (forcefully stopped) or finished (when running through)
  events.find(({ type }) => type === Event.WORKFLOW_TERMINATED || type === Event.WORKFLOW_FINISHED)
)

const getWorkflowDuration = (wf, events) => {
  const startingEvent = getStartedEvent(wf, events)
  if (!startingEvent) return 0

  const endingEvent = getEndingEvent(wf, events)

  if (!endingEvent) {
    return Date.now() - startingEvent.createdAt
  }

  return endingEvent.createdAt - startingEvent.createdAt
}

const getActiveTarget = (wf, events, inputNodeId) => {
  // we need to find the latest phase that started and defines a command for the given
  // input node; because the first phase in a workflow should always define default inputs
  // for all targets, there should always be a result!
  const phaseStartedEvents = getEventsByType(events, Event.PHASE_STARTED).reverse()

  for (const event of phaseStartedEvents) {
    const { data: { phaseId } } = event
    const phase = Phases.getById(wf, phaseId)
    const { commands } = phase

    const inputCommand = commands.find(command => command.inputNodeId === inputNodeId)
    if (inputCommand) return inputCommand.target
  }
}

const getPhaseDuration = (wf, events, phaseId, occurenceIdx = 0) => {
  const phaseStartedEvents = events.filter(({ type, data }) => (
    type === Event.TYPES.PHASE_STARTED && data.phaseid === phaseId
  ))

  const phaseStartedEvent = phaseStartedEvents.length < (occurenceIdx + 1)
    ? null
    : phaseStartedEvents[occurenceIdx]

  if (!phaseStartedEvent) return 0

  // a phase can end in multiple ways:
  // 1. The process is finished after it
  // 2. One of its interrupting event listeners is triggered after it has started

  const listenerIds = EventListeners
    .getManyBy(wf, { phaseId, interrupting: true })
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
    .map(({ data: { phaseId } }) => Phases.getById(wf, phaseId))
)

const getActivationEventsForElement = el => {
  const { type, data } = el

  switch (type) {
    case true :
      return []
    case Event.TYPES.FLOW_SIGNALED:
      return []
    case Event.TYPES.PHASE_STARTED:
      return []
    case Event.TYPES.GATEWAY_ACTIVATED:
      return []
    default:
      return []
  }

}

const getActivatedElementsUntil = (wf, elementType, element, occurenceIdx = 0) => {
  // returns all workflow elements that were activated until the provided
  // element was activated for the n-th time
    const { type, id } = element

  const pathRelevantEventTypes = [
    Event.TYPES.EVENT_LISTENER_ACTIVATED,
    Event.TYPES.FLOW_SIGNALED,
    Event.TYPES.PHASE_STARTED,
    Event.TYPES.GATEWAY_ACTIVATED,
  ]



}

module.exports = {
  getEventsByType,
  getStartedEvent,
  getEndingEvent,
  getWorkflowDuration,
  getActiveTarget,
  getPhaseDuration,
  getExecutedPhaseSequence,
}
