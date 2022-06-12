const Joi = require('joi')
const Gateway = require('./Gateway')

class OrMergeGateway extends Gateway {

  static get TYPE() {
    return 'OR_MERGE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(OrMergeGateway.TYPE).default(OrMergeGateway.TYPE),
    }))
  }

}

module.exports = OrMergeGateway
