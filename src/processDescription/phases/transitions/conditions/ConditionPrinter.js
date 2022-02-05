class ConditionPrinter {

  static get INDENTATION_SPACES() { return 4 }

  static printDataSource() {
    return 'DATA_SOURCE'
  }

  static printIndentation(indentation) {
    return ' '.repeat(indentation)
  }

  static printOperator(operator, indentation) {
    return `${ConditionPrinter.printIndentation(indentation)}${operator}`
  }

  static printValue(value) {
    if (value === null) return null
    if (typeof value !== 'object') return value

    return ConditionPrinter.printDataSource(value)
  }

  static printRow(condition, indentation) {
    return `${ConditionPrinter.printIndentation(indentation)}`
      + `${ConditionPrinter.printValue(condition.left)}`
      + ` ${ConditionPrinter.printOperator(condition.operator)}`
      + ` ${ConditionPrinter.printValue(condition.right)}`
      + '\n'
  }

  static calcAddedIndentation(
    condition,
    lastSeenCombinatorOnIndentationLevelMap,
    indentation,
    flatten,
  ) {
    if (!flatten) return ConditionPrinter.INDENTATION_SPACES
    if (lastSeenCombinatorOnIndentationLevelMap[indentation] === condition.operator) return 0

    return ConditionPrinter.INDENTATION_SPACES
  }

  static printCombinator(condition, lastSeenCombinatorOnIndentationLevelMap, indentation, flatten) {
    if (flatten && lastSeenCombinatorOnIndentationLevelMap[indentation] === condition.operator) return ''
    return `${ConditionPrinter.printOperator(condition.operator, indentation)}\n`
  }

  /*
   * lastSeenCombinatorOnIndentationLevelMap helps us to format the output in a
   * similar way as we would see the query builder structure. Due to the recursive
   * nature of the data model a condition like A AND B AND C would be structured like
   * this in the data model
   * { operator: 'and', left: 'A', right: { operator: 'and', left: B, right: c } }
   * or short A AND (B AND C), printed
   *
   * and
   *     A
   *     and
   *         B
   *         C
   *
   * by keeping track of the which combinator (AND or OR) has been seen last on an
   * indentation level, we can format this to
   *
   * and
   *     A
   *     B
   *     C
   *
   * usage is triggered via the flatten flag (defaults to true)
   */

  static generatePrintOut(
    condition,
    {
      flatten = true,
      indentation = 0,
      nestingLevel = 0,
      lastSeenCombinatorOnIndentationLevelMap = {},
    },
  ) {

    let output = ''

    if (condition.operator !== 'or' && condition.operator !== 'and') {
      return ConditionPrinter.printRow(condition, indentation)
    }

    output += ConditionPrinter
      .printCombinator(condition, lastSeenCombinatorOnIndentationLevelMap, indentation, flatten)
    // eslint-disable-next-line
    lastSeenCombinatorOnIndentationLevelMap[nestingLevel] = condition.operator

    output += ConditionPrinter.generatePrintOut(
      condition.left,
      {
        indentation: indentation + ConditionPrinter.calcAddedIndentation(
          condition.left,
          lastSeenCombinatorOnIndentationLevelMap,
          indentation,
          flatten,
        ),
        nestingLevel: nestingLevel + 1,
        lastSeenCombinatorOnIndentationLevelMap,
        flatten,
      },
    )

    output += ConditionPrinter.generatePrintOut(
      condition.right,
      {
        indentation: indentation + ConditionPrinter.calcAddedIndentation(
          condition.right,
          lastSeenCombinatorOnIndentationLevelMap,
          indentation,
          flatten,
        ),
        nestingLevel: nestingLevel + 1,
        lastSeenCombinatorOnIndentationLevelMap,
        flatten,
      },
    )

    return output
  }

  static print(condition, { flatten } = {}) {
    const res = ConditionPrinter.generatePrintOut(condition, { flatten })
    console.log(res) //eslint-disable-line
  }

}

module.exports = ConditionPrinter
