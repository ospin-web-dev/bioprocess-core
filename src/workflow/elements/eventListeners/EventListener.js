const Joi = require('joi')
const Element = require('../Element')

class EventListener extends Element {

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      interrupting: Joi.boolean().default(true),
      phaseBound: Joi.boolean().default(false),
      phaseId: Joi.any().when('phaseBound', {
        is: true,
        then: super.SCHEMA.extract('id'),
        otherwise: Joi.forbidden(),
      }),
      actions: Joi.array().default([]),
    }))
  }

}

module.exports = EventListener
