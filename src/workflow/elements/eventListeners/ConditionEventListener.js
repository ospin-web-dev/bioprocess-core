const Joi = require('joi')
const EventListener = require('./EventListener')
const Condition = require('../../../conditions/Condition')

class ConditionEventListener extends EventListener {

  static get TYPE() {
    return 'CONDITION'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(ConditionEventListener.TYPE).default(ConditionEventListener.TYPE),
      condition: Condition.SCHEMA.default(),
    }))
  }

}

module.exports = ConditionEventListener
