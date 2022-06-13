const Joi = require('joi')
const deepClone = require('deep-clone')
const DataSource = require('./dataSources/DataSource')

class Condition {

  static get OPERATORS() {
    return {
      AND: 'AND',
      OR: 'OR',
      EQUAL: '==',
      GREATER_THAN: '>',
      GREATER_THAN_OR_EQUAL: '>=',
      LESS_THAN: '<',
      LESS_THAN_OR_EQUAL: '<=',
    }
  }

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
      ).allow(null),
      right: Joi.alternatives().try(
        Joi.number().strict(),
        Joi.string(),
        Joi.boolean(),
        Joi.link('...'),
        Joi.object({
          dataSource: DataSource.SCHEMA,
        }),
      ).allow(null),
      conditions: Joi.array().items(Joi.link('...')),
      options: Joi.object().default({}),
      id: Joi.string().required(),
    }).xor('conditions', 'left').xor('conditions', 'right')
  }

  static getUniqueConditionId(rootCondition = null) {
    const prefix = 'condition'
    let counter = 0
    let id = `${prefix}_${counter}`

    if (rootCondition === null) {
      return id
    }

    const existingIds = Condition.getAllConditionIds(rootCondition)

    while (existingIds.includes(id)) {
      counter += 1
      id = `${prefix}_${counter}`
    }

    return id
  }

  static getAllConditionIds(rootCondition) {
    const ids = []

    const traverse = currentCon => {
      const {
        id,
        conditions,
      } = currentCon

      ids.push(id)

      if (conditions) {
        conditions.forEach(traverse)
      }
    }

    traverse(rootCondition)
    return ids
  }

  static create(rootCondition, data = {}) {
    return Joi
      .attempt({ ...data, id: Condition.getUniqueConditionId(rootCondition) }, Condition.SCHEMA)
  }

  static createRootCondition() {
    return Condition.create(null, {
      operator: Condition.OPERATORS.AND,
      conditions: [],
    })
  }

  static getConditionById(rootCondition, conditionId) {
    let foundCondition

    const traverse = currentCon => {
      const {
        id,
        conditions,
      } = currentCon

      if (id === conditionId) {
        foundCondition = currentCon
        return
      }

      if (conditions) {
        conditions.forEach(traverse)
      }
    }

    traverse(rootCondition)
    return foundCondition
  }

  static getParentGroupById(rootCondition, conditionId) {
    let foundGroup

    const traverse = currentCon => {
      const { conditions } = currentCon

      if (!conditions) return

      if (conditions.some(groupCon => groupCon.id === conditionId)) {
        foundGroup = currentCon
        return
      }

      if (conditions) {
        conditions.forEach(traverse)
      }
    }

    traverse(rootCondition)
    return foundGroup
  }

  static addConditionToGroup(rootCondition, groupId) {
    const conditionClone = deepClone(rootCondition)
    const newCon = Condition.create(rootCondition, { left: null, right: null })
    const group = Condition.getConditionById(conditionClone, groupId)

    group.conditions.push(newCon)
    return conditionClone
  }

  static addGroupToGroup(rootCondition, groupId) {
    const conditionClone = deepClone(rootCondition)
    const newCon = Condition.create(rootCondition, { conditions: [], operator: 'AND' })
    const group = Condition.getConditionById(conditionClone, groupId)

    group.conditions.push(newCon)
    return conditionClone
  }

  static setConditionProp(rootCondition, conditionId, propName, value) {
    const conditionClone = deepClone(rootCondition)
    const con = Condition.getConditionById(conditionClone, conditionId)
    con[propName] = value
    return conditionClone
  }

  static setOperator(rootCondition, conditionId, newOperator) {
    return Condition.setConditionProp(rootCondition, conditionId, 'operator', newOperator)
  }

  static setLeft(rootCondition, conditionId, newLeft) {
    return Condition.setConditionProp(rootCondition, conditionId, 'left', newLeft)
  }

  static setRight(rootCondition, conditionId, newRight) {
    return Condition.setConditionProp(rootCondition, conditionId, 'right', newRight)
  }

  static deleteConditionFromGroup(rootCondition, conditionId) {
    const conditionClone = deepClone(rootCondition)
    const group = Condition.getParentGroupById(conditionClone, conditionId)
    group.conditions = group.conditions.filter(groupCon => groupCon.id !== conditionId)
    return conditionClone
  }

}

module.exports = Condition
