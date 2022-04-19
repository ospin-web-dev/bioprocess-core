const Joi = require('joi')
const EventDispatcher = require('./EventDispatcher')

class EndEventDispatcher extends EventDispatcher {

  static get TYPE() {
    return 'END'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(EndEventDispatcher.TYPE).required(),
    }))
  }

}

module.exports = EndEventDispatcher
