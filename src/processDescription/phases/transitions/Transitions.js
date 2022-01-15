const Joi = require('joi')
const Transition = require('./Transition')

class Transitions {

  static get SCHEMA() {
    return Joi.array().items(Transition.SCHEMA)
  }

  static validate(data) {
    return Joi.assert(data, Transitions.SCHEMA)
  }

}

module.exports = Transitions
