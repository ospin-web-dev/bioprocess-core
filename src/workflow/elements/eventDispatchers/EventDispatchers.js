const ElementsHandler = require('../ElementsHandler')
const EndEventDispatcher = require('./EndEventDispatcher')

const NoEndEventDispatcherError = require('../../validator/errors/NoEndEventDispatcherError')

class EventDispatchers extends ElementsHandler {

  static get COLLECTION_NAME() {
    return 'eventDispatchers'
  }

  static get ID_PREFIX() {
    return 'eventDispatcher'
  }

  static get TYPE_TO_INTERFACE_MAP() {
    return {
      [EndEventDispatcher.TYPE]: EndEventDispatcher,
    }
  }

  static getInterface(eventDispatcher) {
    return EventDispatchers.TYPE_TO_INTERFACE_MAP[eventDispatcher.type]
  }

  static isLastEndEventDispatcher(workflow, eventDispatcherId) {
    const dispatcher = this.getById(workflow, eventDispatcherId)
    if (dispatcher.type === EndEventDispatcher.TYPE) {
      const allEndEventDispatchers = EventDispatchers
        .getManyBy(workflow, { type: EndEventDispatcher.TYPE })
      return allEndEventDispatchers.length === 1
    }
    return false
  }

  static remove(workflow, eventDispatcherId) {
    if (EventDispatchers.isLastEndEventDispatcher(workflow, eventDispatcherId)) {
      throw new NoEndEventDispatcherError()
    }
    return this.removeElement(workflow, eventDispatcherId)
  }

  static addEndEventDispatcher(workflow, data) {
    return this.addElement(workflow, EndEventDispatcher, data)
  }

}

module.exports = EventDispatchers
