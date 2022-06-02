const ElementsHandler = require('../ElementsHandler')
const EndEventDispatcher = require('./EndEventDispatcher')

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

  static removeEventDispatcher(workflow, eventDispatcherId) {
    return this.remove(workflow, eventDispatcherId)
  }

  static addEndEventDispatcher(workflow, data) {
    return this.add(workflow, EndEventDispatcher, data)
  }

}

module.exports = EventDispatchers
