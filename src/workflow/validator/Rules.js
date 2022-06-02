const EventListeners = require('../elements/eventListeners/EventListeners')
const StartEventListener = require('../elements/eventListeners/StartEventListener')

class Rules {

  static containsExactlyOneStartEventListener(workflow) {
    const listeners = EventListeners.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (listeners.length !== 1) throw new Error('Workflow has to contain exactly one START event listener')
  }

}

module.exports = Rules
