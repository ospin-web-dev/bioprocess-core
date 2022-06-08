const Joi = require('joi')
const Gateway = require('./Gateway')

class AndSplitGateway extends Gateway {

  static get TYPE() {
    return 'AND_SPLIT'
  }

  static get SCHEMA() {
    return super.SCHEMA.concat(Joi.object({
      type: Joi.string().allow(AndSplitGateway.TYPE).default(AndSplitGateway.TYPE),
    }))
  }

}

module.exports = AndSplitGateway
