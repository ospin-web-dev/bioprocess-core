const Joi = require('joi')
const Gateway = require('./Gateway')

class AndSplitGateway extends Gateway {

  static get TYPE() {
    return 'AND_SPLIT'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndSplitGateway.TYPE).default(AndSplitGateway.TYPE),
      incoming: super.SCHEMA.extract('id').optional().allow(null).default(null),
      outgoing: Joi.array().items(super.SCHEMA.extract('id').optional()).default([]),
    }))
  }

}

module.exports = AndSplitGateway
