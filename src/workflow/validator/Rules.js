const EventListeners = require('../elements/eventListeners/EventListeners')
const Phases = require('../elements/phases/Phases')
const EventDispatchers = require('../elements/eventDispatchers/EventDispatchers')
const StartEventListener = require('../elements/eventListeners/StartEventListener')
const EndEventDispatcher = require('../elements/eventDispatchers/EndEventDispatcher')

class Rules {

  static containsExactlyOneStartEventListener(workflow) {
    const listeners = EventListeners.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (listeners.length !== 1) throw new Error('Workflow has to contain exactly one START event listener')
  }

  static containsAtLeastOnePhase(workflow) {
    const phases = Phases.getAll(workflow)
    if (phases.length === 0) throw new Error('Workflow has to contain at least one phase')
  }

  static containsAtLeastOneEndEventDispatcher(workflow) {
    const dispatchers = EventDispatchers.getManyBy(workflow, { type: EndEventDispatcher.TYPE })
    if (dispatchers.length === 0) throw new Error('Workflow has to contain at least one END event dispatcher')
  }

}

module.exports = Rules
