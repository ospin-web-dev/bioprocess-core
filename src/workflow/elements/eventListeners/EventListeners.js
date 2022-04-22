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

  static removeEventListener(workflow, eventListenerId) {
    return this.removeElement(workflow, eventListenerId)
  }

  static addApprovalEventListener(workflow, data) {
    return this.addElement(workflow, ApprovalEventListener, data)
  }

  static addConditionEventListener(workflow, data) {
    return this.addElement(workflow, ConditionEventListener, data)
  }

  static addStartEventListener(workflow, data) {
    return this.addElement(workflow, StartEventListener, data)
  }

  static addTimerEventListener(workflow, data) {
    return this.addElement(workflow, TimerEventListener, data)
  }

  static updateEventListener(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = EventListeners
