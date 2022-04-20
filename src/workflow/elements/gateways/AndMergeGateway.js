const Joi = require('joi')
const Gateway = require('./Gateway')

class AndMergeGateway extends Gateway {

  static get TYPE() {
    return 'AND_MERGE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndMergeGateway.TYPE).default(AndMergeGateway.TYPE),
      outgoing: super.SCHEMA.extract('id').optional().allow(null).default(null),
      incoming: Joi.array().items(super.SCHEMA.extract('id').optional()).default([]),
    }))
  }

}

module.exports = AndMergeGateway
