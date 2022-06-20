const EventListeners = require('../elements/eventListeners/EventListeners')
const Phases = require('../elements/phases/Phases')
const EventDispatchers = require('../elements/eventDispatchers/EventDispatchers')
const StartEventListener = require('../elements/eventListeners/StartEventListener')
const EndEventDispatcher = require('../elements/eventDispatchers/EndEventDispatcher')
const WorkflowGraphTools = require('../WorkflowGraphTools')
const IncorrectAmountOfStartEventListenersError = require('../errors/IncorrectAmountOfStartEventListenersError')
const NoPhasesError = require('../errors/NoPhasesError')
const UnreachablePhaseError = require('../errors/UnreachablePhaseError')
const NoEndEventDispatcherError = require('../errors/NoEndEventDispatcherError')
const UnreachableEndEventDispatcherError = require('../errors/UnreachableEndEventDispatcherError')

const containsExactlyOneStartEventListener = wf => {
  const startEventListeners = EventListeners
    .getManyBy(wf, { type: StartEventListener.TYPE })
  if (startEventListeners.length !== 1) {
    throw new IncorrectAmountOfStartEventListenersError()
  }
}

const containsAtLeastOnePhase = wf => {
  const phases = Phases.getAll(wf)
  if (phases.length === 0) throw new NoPhasesError()
}

const everyPhaseIsReachable = wf => {
  const phases = Phases.getAll(wf)
  phases.forEach(phase => {
    if (!WorkflowGraphTools.elementIsReachable(wf, phase.id)) {
      throw new UnreachablePhaseError({ phase })
    }
  })
}

const containsAtLeastOneEndEventDispatcher = wf => {
  const dispatchers = EventDispatchers.getManyBy(wf, { type: EndEventDispatcher.TYPE })
  if (dispatchers.length === 0) throw new NoEndEventDispatcherError()
}

const everyEndEventDispatcherIsReachable = wf => {
  const dispatchers = EventDispatchers.getManyBy(wf, { type: EndEventDispatcher.TYPE })
  dispatchers.forEach(endEventDispatcher => {
    if (!WorkflowGraphTools.elementIsReachable(wf, endEventDispatcher.id)) {
      throw new UnreachableEndEventDispatcherError({ endEventDispatcher })
    }
  })
}

module.exports = {
  containsExactlyOneStartEventListener,
  containsAtLeastOnePhase,
  everyPhaseIsReachable,
  containsAtLeastOneEndEventDispatcher,
  everyEndEventDispatcherIsReachable,
}
