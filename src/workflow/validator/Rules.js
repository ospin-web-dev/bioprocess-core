const EventListeners = require('../elements/eventListeners/EventListeners')
const Phases = require('../elements/phases/Phases')
const EventDispatchers = require('../elements/eventDispatchers/EventDispatchers')
const StartEventListener = require('../elements/eventListeners/StartEventListener')
const EndEventDispatcher = require('../elements/eventDispatchers/EndEventDispatcher')
const WorkflowGraphTools = require('../WorkflowGraphTools')
const IncorrectAmountOfStartEventListenersError = require('./errors/IncorrectAmountOfStartEventListenersError')
const NoPhasesError = require('./errors/NoPhasesError')
const UnreachablePhaseError = require('./errors/UnreachablePhaseError')
const NoEndEventDispatcherError = require('./errors/NoEndEventDispatcherError')
const UnreachableEndEventDispatcherError = require('./errors/UnreachableEndEventDispatcherError')

class Rules {

  static containsExactlyOneStartEventListener(workflow) {
    const startEventListeners = EventListeners
      .getManyBy(workflow, { type: StartEventListener.TYPE })
    if (startEventListeners.length !== 1) {
      throw new IncorrectAmountOfStartEventListenersError({ startEventListeners })
    }
  }

  static containsAtLeastOnePhase(workflow) {
    const phases = Phases.getAll(workflow)
    if (phases.length === 0) throw new NoPhasesError()
  }

  static everyPhaseIsReachable(workflow) {
    const phases = Phases.getAll(workflow)
    phases.forEach(phase => {
      if (!WorkflowGraphTools.elementIsReachable(workflow, phase.id)) {
        throw new UnreachablePhaseError({ phase })
      }
    })
  }

  static containsAtLeastOneEndEventDispatcher(workflow) {
    const dispatchers = EventDispatchers.getManyBy(workflow, { type: EndEventDispatcher.TYPE })
    if (dispatchers.length === 0) throw new NoEndEventDispatcherError()
  }

  static everyEndEventDispatcherIsReachable(workflow) {
    const dispatchers = EventDispatchers.getManyBy(workflow, { type: EndEventDispatcher.TYPE })
    dispatchers.forEach(endEventDispatcher => {
      if (!WorkflowGraphTools.elementIsReachable(workflow, endEventDispatcher.id)) {
        throw new UnreachableEndEventDispatcherError({ endEventDispatcher })
      }
    })
  }

}

module.exports = Rules
