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

const getPhaseDuration = (wf, events, phaseId, occurence = 1) => {
  const phaseStartedEvents = events.filter(({ type, data }) => (
    type === Event.TYPES.PHASE_STARTED && data.phaseid === phaseId
  ))

  const phaseStartedEvent = phaseStartedEvents.length < occurence ? null : phaseStartedEvent[occurence - 1]
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

  const phaseEndingEvent = phaseEndingEvents.length < occurence ? null : phaseEndingEvents[occurence - 1]
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

const getExecutionPaths = (wf, events) => {
  // This is based on the fact that no two elements can have the same
  // "next" element at the same time (because all elements are connected via flows)
  // and flows can only connect exactly two elements; The only exception are "implit ORs"
  // where two or more flows are attached to the same destination element and they are triggered at the same time,
  // e.g. via an AND gateway. In that case however either only one flow will be
  // considered (for phases and event listeners) or will resolve after they either
  // caused multiple event dispatching or are handled by gateways
  //
  // There are 4 ways how a new execution thread can be introduced:
  // 1. OrGateway with multiple outflows
  // 2. AndGateway with multiple outflows
  // 3. A non-interrupting phase event listener
  // 4. A global event listener (that is not the START) without
  // in incoming flow (which makes it active per default);

  const pathRelevantEventTypes = [
    Event.TYPES.EVENT_LISTENER_ACTIVATED,
    Event.TYPES.EVENT_RECEIVED,
    Event.TYPES.FLOW_SIGNALED,
    Event.TYPES.PHASE_STARTED,
    Event.TYPES.GATEWAY_ACTIVATED,
  ]

  const relevantEvents = events
    .filter(event => pathRelevantEventTypes.includes(event.type))

  const startNewExecutionPath = event => {
    const { type, data } = event
    switch (type) {
      case Event.TYPES.EVENT_RECEIVED: {
        const el = EventListeners.findById(wf, data.eventListenerId)
        if (el.phaseId === null || el.interrupting === false) return true

        return false
      }
      case Event.TYPES.GATEWAY_ACTIVATED: {
        const gw = Gateways.findById(wf, data.gatewayId)
        const relevantGatewayTypes = [ Gateways.TYPES.OR, Gateways.TYPES.AND ]
        if (!relevantGatewayTypes.includes(gw.type)) return false

        const outgoingFlows = Flows.getOutgoingFlows(wf, gw.id)
        if (outgoingFlows.length <= 1) return false

        return true
      }
      default:
        return false
    }

  }

  const paths = relevantEvents.reduce((acc, currEvent) => {
    const createNewPath = startNewExecutionPath(currEvent)

    if (createNewPath) {
      // for gateways, we actually create n-1 new paths, where
      // n is the amount of outgoing flows
      const relevantGatewayTypes = [ Gateways.TYPES.OR, Gateways.TYPES.AND ]
      if (relevantGatewayTypes.includes(currEvent.type)) {
        const outgoingFlows = Flows.getOutgoingFlows(wf, currEvent.data.gatewayId)
        outgoingFlows.forEach(() => acc.push([ currEvent ]))
      }
      else {

      }
      return []
    }



  }, [])
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
