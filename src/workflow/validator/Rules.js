const EventListeners = require('../elements/eventListeners/EventListeners')
const Phases = require('../elements/phases/Phases')
const EventDispatchers = require('../elements/eventDispatchers/EventDispatchers')
const StartEventListener = require('../elements/eventListeners/StartEventListener')
const EndEventDispatcher = require('../elements/eventDispatchers/EndEventDispatcher')
const WorkflowGraphTools = require('../WorkflowGraphTools')

class Rules {

  static containsExactlyOneStartEventListener(workflow) {
    const listeners = EventListeners.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (listeners.length !== 1) throw new Error('Workflow has to contain exactly one START event listener')
  }

  static containsAtLeastOnePhase(workflow) {
    const phases = Phases.getAll(workflow)
    if (phases.length === 0) throw new Error('Workflow has to contain at least one phase')
  }

  static everyPhaseIsReachable(workflow) {
    const phases = Phases.getAll(workflow)
    phases.forEach(phase => {
      if (!WorkflowGraphTools.elementIsReachable(workflow, phase.id)) {
        throw new Error('Workflow contains unreachable phase')
      }
    })
  }

  static everyEndEventDispatcherIsReachable(workflow) {
    const dispatchers = EventDispatchers.getManyBy(workflow, { type: EndEventDispatcher.TYPE })
    dispatchers.forEach(dispatcher => {
      if (!WorkflowGraphTools.elementIsReachable(workflow, dispatcher.id)) {
        throw new Error('Workflow contains unreachable END event dispatcher')
      }
    })
  }

  static containsAtLeastOneEndEventDispatcher(workflow) {
    const dispatchers = EventDispatchers.getManyBy(workflow, { type: EndEventDispatcher.TYPE })
    if (dispatchers.length === 0) throw new Error('Workflow has to contain at least one END event dispatcher')
  }

}

module.exports = Rules
