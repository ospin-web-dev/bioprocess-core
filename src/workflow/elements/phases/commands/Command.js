const Joi = require('joi')

class Command {

  static get TYPES() {
    return {
      SET_TARGETS: 'SET_TARGETS',
    }
  }

  static get DATA_SCHEMAS() {
    return {
      [Command.TYPES.SET_TARGETS]: Joi.object({
        fctId: Joi.string().required(),
        slotName: Joi.string().required(),
        target: Joi.alternatives().try(Joi.string(), Joi.number().strict(), Joi.boolean().strict()),
      }),
    }
  }

  static get SCHEMA() {
    return Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid(...Object.values(Command.TYPES)).required(),
      data: Joi.any().when('type', {
        is: Command.TYPES.SET_TARGETS,
        then: Command.DATA_SCHEMAS[Command.TYPES.SET_TARGETS].required(),
        otherwise: Joi.forbidden(),
      }),
    })
  }

  static create(data) {
    return Joi.attempt(data, this.SCHEMA)
  }

}

module.exports = Command
