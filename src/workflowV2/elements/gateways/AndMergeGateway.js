const Joi = require('joi')
const Gateway = require('./Gateway')

class AndMergeGateway extends Gateway {

  static get TYPE() {
    return 'AND_MERGE'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndMergeGateway.TYPE).default(AndMergeGateway.TYPE),
    }))
  }

}

module.exports = AndMergeGateway
