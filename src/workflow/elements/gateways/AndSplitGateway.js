const Joi = require('joi')
const Gateway = require('./Gateway')

class AndSplitGateway extends Gateway {

  static get TYPE() {
    return 'AND_SPLIT'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndSplitGateway.TYPE).required(),
      incoming: super.SCHEMA.extract('id').allow(null),
      outgoing: Joi.array().items(super.SCHEMA.extract('id')).default([]),
    }))
  }

}

module.exports = AndSplitGateway
