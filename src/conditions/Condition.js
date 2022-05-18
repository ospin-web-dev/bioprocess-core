const Joi = require('joi')
const DataSource = require('./dataSources/DataSource')

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
          dataSource: DataSource.SCHEMA,
        }),
      ).allow(null).default(null),
      right: Joi.alternatives().try(
        Joi.number().strict(),
        Joi.string(),
        Joi.boolean(),
        Joi.link('...'),
        Joi.object({
          dataSource: DataSource.SCHEMA, // placeholder - data sources still top be defined
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
    return Condition.create({ operator: 'AND', left: condition, right: rightSide })
  }

  static wrapInOr(condition, rightSide = Condition.create()) {
    return Condition.create({ operator: 'OR', left: condition, right: rightSide })
  }

  static isCombinatorOperator(operator) {
    return operator === 'OR' || operator === 'AND'
  }

  static parseFromASTToGroupRepresentation(condition) {
    /* this is easier to render for the UI because it does not nest as deep
     * it groups chained AND and OR into a conditions array on the start of the chain
     */

    const build = (curr, lastSeenGroup) => {
      let newGroup

      if (!Condition.isCombinatorOperator(curr.operator)) {
        if (lastSeenGroup) {
          lastSeenGroup.conditions.push({ ...curr, group: false })
        } else {
          return { ...curr, group: false }
        }
      } else if (lastSeenGroup && lastSeenGroup.operator === curr.operator) {
        build(curr.left, lastSeenGroup)
        build(curr.right, lastSeenGroup)
      } else {
        newGroup = { group: true, operator: curr.operator, conditions: [] }
        if (lastSeenGroup) {
          lastSeenGroup.conditions.push(newGroup)
        }
        build(curr.left, newGroup)
        build(curr.right, newGroup)
      }

      return newGroup
    }

    return build(condition)
  }

}

module.exports = Condition
