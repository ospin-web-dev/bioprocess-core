const Joi = require('joi')

const TYPES = {
  SET_TARGETS: 'SET_TARGETS',
}

const DATA_SCHEMAS = {
  [TYPES.SET_TARGETS]: Joi.object({
    targets: Joi.array().items(Joi.object({
      inputNodeId: Joi.string().required(),
      target: Joi.alternatives()
        .try(Joi.string(), Joi.number().strict(), Joi.boolean().strict()),
    })),
  }),
}

const SCHEMA = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid(...Object.values(TYPES)).required(),
  data: Joi.any().when('type', {
    is: TYPES.SET_TARGETS,
    then: DATA_SCHEMAS.SET_TARGETS,
    otherwise: Joi.forbidden(),
  }),
})

module.exports = {
  SCHEMA,
  TYPES,
}
