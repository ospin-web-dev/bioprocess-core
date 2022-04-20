const Joi = require('joi')
const Gateway = require('./Gateway')

class LoopGateway extends Gateway {

  static get TYPE() {
    return 'LOOP'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(LoopGateway.TYPE).required(),
      maxIterations: Joi.number().integer().strict().default(1),
      incoming: super.SCHEMA.extract('id').allow(null).default(null),
      outgoing: super.SCHEMA.extract('id').allow(null).default(null),
      loopback: super.SCHEMA.extract('id').allow(null).default(null),
    }))
  }

}

module.exports = LoopGateway
