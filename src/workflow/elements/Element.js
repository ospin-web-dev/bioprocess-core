const Joi = require('joi')

class Element {

  constructor() {
    forbidInitializing(new.target, Element)
  }

  static get SCHEMA() {
    return Joi.object({
      id: Joi.number().integer().strict().required(),
    })
  }


}

module.exports = Element
