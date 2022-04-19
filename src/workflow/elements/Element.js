const Joi = require('joi')

class Element {

  static get SCHEMA() {
    return Joi.object({
      id: Joi.string().required(),
    })
  }


}

module.exports = Element
