const ElementsHandler = require('../ElementsHandler')
const ApprovalEventListener = require('./ApprovalEventListener')
const ConditionEventListener = require('./ConditionEventListener')
const StartEventListener = require('./StartEventListener')
const TimerEventListener = require('./TimerEventListener')

const IncorrectAmountOfStartEventListenersError = require('../../validator/errors/IncorrectAmountOfStartEventListenersError')

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

  static remove(workflow, eventListenerId) {
    if (EventListeners.isStartEventListener(workflow, eventListenerId)) {
      throw new IncorrectAmountOfStartEventListenersError()
    }
    return this.removeElement(workflow, eventListenerId)
  }

  static addApprovalEventListener(workflow, data) {
    return this.addElement(workflow, ApprovalEventListener, data)
  }

  static addConditionEventListener(workflow, data) {
    return this.addElement(workflow, ConditionEventListener, data)
  }

  static addStartEventListener(workflow, data) {
    const existingListeners = this.getManyBy(workflow, { type: StartEventListener.TYPE })
    if (existingListeners.length > 0) throw new IncorrectAmountOfStartEventListenersError()
    return this.addElement(workflow, StartEventListener, data)
  }

  static addTimerEventListener(workflow, data) {
    return this.addElement(workflow, TimerEventListener, data)
  }

  static update(workflow, id, data) {
    return this.updateElement(workflow, id, data)
  }

}

module.exports = EventListeners
