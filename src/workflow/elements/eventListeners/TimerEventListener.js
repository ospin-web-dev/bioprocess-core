const Joi = require('joi')
const EventListener = require('./EventListener')

class TimerEventListener extends EventListener {

  static get TYPE() {
    return 'TIMER'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(TimerEventListener.TYPE).required(),
      durationInMS: Joi.number().integer().strict(),
    }))
  }

}

module.exports = TimerEventListener
