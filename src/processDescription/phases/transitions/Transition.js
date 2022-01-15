const Joi = require('joi')

class Transition {

  static get SCHEMA() {
    return Joi.object({
      condition: Joi.object({}).required(),
      destinationPhaseId: Joi.number().integer().strict().required(),
      id: Joi.number().integer().strict().required(),
    })
  }

  static validate(data) {
    return Joi.assert(data, Transition.SCHEMA)
  }

}

module.exports = Transition
