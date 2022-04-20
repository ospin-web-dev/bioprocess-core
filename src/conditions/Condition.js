const Joi = require('joi')

class Condition {

  static get SCHEMA() {
    return Joi.object({
      operator: Joi.string().allow(null).default(null),
      left: Joi.alternatives().try(
        Joi.number().strict(),
        Joi.string(),
        Joi.boolean(),
        Joi.link('...'),
        Joi.object({
          dataSource: { type: 'dataStream' },
        }),
      ).allow(null).default(null),
      right: Joi.alternatives().try(
        Joi.number().strict(),
        Joi.string(),
        Joi.boolean(),
        Joi.link('...'),
        Joi.object({
          dataSource: { type: 'dataStream' },
        }),
      ).allow(null).default(null),
      options: Joi.object().default({}),
    })
  }

  static create(data = {}) {
    return Joi.attempt(data, Condition.SCHEMA)
  }

  static setLeft(condition, newLeft) {
    return { ...condition, left: newLeft }
  }

  static setRight(condition, newRight) {
    return { ...condition, right: newRight }
  }

  static setOperator(condition, newOperator) {
    return { ...condition, operator: newOperator }
  }

  static setOptions(condition, newOptions) {
    return { ...condition, options: newOptions }
  }

  static wrapInAnd(condition, rightSide = Condition.create()) {
    return Condition.create({ operator: 'and', left: condition, right: rightSide })
  }

  static wrapInOr(condition, rightSide = Condition.create()) {
    return Condition.create({ operator: 'or', left: condition, right: rightSide })
  }

}

module.exports = Condition
