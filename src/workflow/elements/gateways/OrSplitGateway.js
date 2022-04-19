const Joi = require('joi')
const Gateway = require('./Gateway')

class OrMergeGateway extends Gateway {

  static get TYPE() {
    return 'OR_MERGE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(OrMergeGateway.TYPE).required(),
      incoming: super.SCHEMA.extract('id').allow(null),
      outgoing: Joi.array().items(super.SCHEMA.extract('id')).default([]),
    }))
  }

}

module.exports = OrMergeGateway
