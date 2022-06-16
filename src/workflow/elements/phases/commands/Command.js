const Joi = require('joi')

const Command = {

  TYPES: {
    SET_TARGETS: 'SET_TARGETS',
  },

  DATA_SCHEMAS: {
    [this.TYPES.SET_TARGETS]: Joi.object({
      targets: Joi.array().items(Joi.object({
        fctId: Joi.string().required(),
        slotName: Joi.string().required(),
        target: Joi.alternatives()
          .try(Joi.string(), Joi.number().strict(), Joi.boolean().strict()),
      })),
    }),
  },

  SCHEMA: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid(...Object.values(this.TYPES)).required(),
    data: Joi.any().when('type', {
      is: this.TYPES.SET_TARGETS,
      then: this.DATA_SCHEMAS.SET_TARGETS,
      otherwise: Joi.forbidden(),
    }),
  }),

  create: data => Joi.attempt(data, this.SCHEMA),

}

module.exports = Command
