const Joi = require('joi')
const Element = require('../Element')

class EventListener extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      interrupting: Joi.boolean().default(true),
      phaseId: super.SCHEMA.extract('id').optional().allow(null).default(null),
    }))
  }

}

module.exports = EventListener
