class Condition {

  static create(operator = null, left = null, right = null, options = {}) {
    return { operator, left, right, options }
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
    return Condition.create('and', condition, rightSide)
  }

  static wrapInOr(condition, rightSide = Condition.create()) {
    return Condition.create('or', condition, rightSide)
  }

}

module.exports = Condition
