const EventListeners = require('../elements/eventListeners/EventListeners')
const Phases = require('../elements/phases/Phases')
const StartEventListener = require('../elements/eventListeners/StartEventListener')

class Rules {

  static containsExactlyOneStartEventListener(workflow) {
    const listeners = EventListeners.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (listeners.length !== 1) throw new Error('Workflow has to contain exactly one START event listener')
  }

  static containsAtLeastOnePhase(workflow) {
    const phases = Phases.getAll(workflow)
    if (phases.length === 0) throw new Error('Workflow has to contain at least one phase')
  }

}

module.exports = Rules
