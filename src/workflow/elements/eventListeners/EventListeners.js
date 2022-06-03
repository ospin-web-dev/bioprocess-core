const ElementsHandler = require('../ElementsHandler')
const ApprovalEventListener = require('./ApprovalEventListener')
const ConditionEventListener = require('./ConditionEventListener')
const StartEventListener = require('./StartEventListener')
const TimerEventListener = require('./TimerEventListener')

class EventListeners extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'eventListeners'
  }

  static get ID_PREFIX() {
    return 'eventListener'
  }

  static get TYPE_TO_INTERFACE_MAP() {
    return {
      [ApprovalEventListener.TYPE]: ApprovalEventListener,
      [ConditionEventListener.TYPE]: ConditionEventListener,
      [StartEventListener.TYPE]: StartEventListener,
      [TimerEventListener.TYPE]: TimerEventListener,
    }
  }

  static getInterface(eventListener) {
    return EventListeners.TYPE_TO_INTERFACE_MAP[eventListener.type]
  }

  static isStartEventListener(workflow, eventListenerId) {
    const listener = this.getById(workflow, eventListenerId)
    return listener.type === StartEventListener.TYPE
  }

  static removeEventListener(workflow, eventListenerId) {
    if (EventListeners.isStartEventListener(workflow, eventListenerId)) {
      throw new Error('Cannot remove START event listener')
    }
    return this.remove(workflow, eventListenerId)
  }

  static addApprovalEventListener(workflow, data) {
    return this.add(workflow, ApprovalEventListener, data)
  }

  static addConditionEventListener(workflow, data) {
    return this.add(workflow, ConditionEventListener, data)
  }

  static addStartEventListener(workflow, data) {
    const existingListeners = this.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (existingListeners.length > 0) throw new Error('Workflow cannot contain more than one START event listener')
    return this.add(workflow, StartEventListener, data)
  }

  static addTimerEventListener(workflow, data) {
    return this.add(workflow, TimerEventListener, data)
  }

  static updateEventListener(workflow, id, data) {
    return this.update(workflow, id, data)
  }

}

module.exports = EventListeners
