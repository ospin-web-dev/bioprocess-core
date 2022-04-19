const Joi = require('joi')
const Gateway = require('./Gateway')

class AndMergeGateway extends Gateway {

  static get TYPE() {
    return 'AND_MERGE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndMergeGateway.TYPE).required(),
      outgoing: super.SCHEMA.extract('id').allow(null).default(null),
      incoming: Joi.array().items(super.SCHEMA.extract('id')).default([]),
    }))
  }

}

module.exports = AndMergeGateway
