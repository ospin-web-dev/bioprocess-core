const Joi = require('joi')
const EventListener = require('./EventListener')

class StartEventListener extends EventListener {

  static get TYPE() {
    return 'START'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(StartEventListener.TYPE).default(StartEventListener.TYPE),
      interrupting: Joi.boolean().allow(true),
      phaseBound: Joi.boolean().allow(false),
    }))
  }

}

module.exports = StartEventListener
