const Joi = require('joi')
const EventListener = require('./EventListener')

class ApprovalEventListener extends EventListener {

  static get TYPE() {
    return 'APPROVAL'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(ApprovalEventListener.TYPE).default(ApprovalEventListener.TYPE),
    }))
  }

}

module.exports = ApprovalEventListener
