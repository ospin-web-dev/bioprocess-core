const Joi = require('joi')
const Element = require('../Element')

class EventListener extends Element {

  static get ELEMENT_TYPE() {
    return 'EVENT_LISTENER'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      interrupting: Joi.boolean().default(true),
      phaseId: super.SCHEMA.extract('id').optional().allow(null).default(null),
      elementType: Joi.string()
        .valid(EventListener.ELEMENT_TYPE).default(EventListener.ELEMENT_TYPE),
    }))
  }

}

module.exports = EventListener
