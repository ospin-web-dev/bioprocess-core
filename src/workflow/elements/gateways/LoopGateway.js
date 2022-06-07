const Joi = require('joi')
const Gateway = require('./Gateway')

class LoopGateway extends Gateway {

  static get TYPE() {
    return 'LOOP'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(LoopGateway.TYPE).default(LoopGateway.TYPE),
      maxIterations: Joi.number().integer().strict().default(1),
      loopback: super.SCHEMA.extract('id').optional().allow(null).default(null),
    }))
  }

}

module.exports = LoopGateway
