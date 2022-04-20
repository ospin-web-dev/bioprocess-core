const Joi = require('joi')

class Element {

  static get SCHEMA() {
    return Joi.object({
      id: Joi.string().required(),
    })
  }

  static create(data) {
    return Joi.attempt(data, this.SCHEMA)
  }

}

module.exports = Element
