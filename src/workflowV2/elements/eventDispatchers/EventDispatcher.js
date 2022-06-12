const Joi = require('joi')
const Element = require('../Element')

class EventDispatcher extends Element {

  static get ELEMENT_TYPE() {
    return 'EVENT_DISPATCHER'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      elementType: Joi.string()
        .valid(EventDispatcher.ELEMENT_TYPE).default(EventDispatcher.ELEMENT_TYPE),
    }))
  }

}

module.exports = EventDispatcher
