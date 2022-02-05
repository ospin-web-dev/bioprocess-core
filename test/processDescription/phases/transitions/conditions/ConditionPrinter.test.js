const ConditionPrinter = require('../../../../../src/processDescription/phases/transitions/conditions/ConditionPrinter')
const Condition = require('../../../../../src/processDescription/phases/transitions/conditions/Condition')

describe('the ConditionPrinter interface', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('print', () => {
    it('prints out a single condition', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const condition = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const expectedPrintOut = '7 > DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('prints out an AND condition properly', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const right = Condition.create()
      const condition = Condition.create('and', left, right)

      const expectedPrintOut = ''
        + 'and\n'
        + '    7 > DATA_SOURCE\n'
        + '    null null null\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('prints out an OR condition nested in an AND condition properly', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const andLeft = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const orLeft = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const orRight = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const or = Condition.create('or', orLeft, orRight)
      const condition = Condition.create('and', andLeft, or)

      const expectedPrintOut = ''
        + 'and\n'
        + '    7 > DATA_SOURCE\n'
        + '    or\n'
        + '        10 == DATA_SOURCE\n'
        + '        5 <= DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('flattens out two consequitive AND conditions', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const and1Left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const and2Left = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const and2Right = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const and2 = Condition.create('and', and2Left, and2Right)
      const condition = Condition.create('and', and1Left, and2)

      const expectedPrintOut = ''
        + 'and\n'
        + '    7 > DATA_SOURCE\n'
        + '    10 == DATA_SOURCE\n'
        + '    5 <= DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('flattens out two consequitive OR conditions', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const or1Left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const or2Left = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const or2Right = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const or2 = Condition.create('or', or2Left, or2Right)
      const condition = Condition.create('or', or1Left, or2)

      const expectedPrintOut = ''
        + 'or\n'
        + '    7 > DATA_SOURCE\n'
        + '    10 == DATA_SOURCE\n'
        + '    5 <= DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('does NOT flatten out two consequitive OR conditions when "flatten" is set to false', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const or1Left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const or2Left = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const or2Right = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const or2 = Condition.create('or', or2Left, or2Right)
      const condition = Condition.create('or', or1Left, or2)

      const expectedPrintOut = ''
        + 'or\n'
        + '    7 > DATA_SOURCE\n'
        + '    or\n'
        + '        10 == DATA_SOURCE\n'
        + '        5 <= DATA_SOURCE\n'

      ConditionPrinter.print(condition, { flatten: false })
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('prints out a condition with three AND conditions of which one is an OR', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const and1Left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const orLeft = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const orRight = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const and2Right = Condition.create('>=', 80, { dataSource: { type: 'dataStream' } })
      const or = Condition.create('or', orLeft, orRight)
      const and2 = Condition.create('and', or, and2Right)
      const condition = Condition.create('and', and1Left, and2)

      const expectedPrintOut = ''
        + 'and\n'
        + '    7 > DATA_SOURCE\n'
        + '    or\n'
        + '        10 == DATA_SOURCE\n'
        + '        5 <= DATA_SOURCE\n'
        + '    80 >= DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })

    it('prints out a condition with fors AND conditions of which two are an OR', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation()
      const and1Left = Condition.create('>', 7, { dataSource: { type: 'dataStream' } })
      const or1Left = Condition.create('==', 10, { dataSource: { type: 'dataStream' } })
      const or1Right = Condition.create('<=', 5, { dataSource: { type: 'dataStream' } })
      const or1 = Condition.create('or', or1Left, or1Right)
      const or2Left = Condition.create('==', 20, { dataSource: { type: 'dataStream' } })
      const or2Right = Condition.create('<=', 24, { dataSource: { type: 'dataStream' } })
      const or2 = Condition.create('or', or2Left, or2Right)
      const and2Left = Condition.create('>=', 80, { dataSource: { type: 'dataStream' } })
      const and2 = Condition.create('and', and2Left, or2)

      const and1Right = Condition.create('and', or1, and2)
      const condition = Condition.create('and', and1Left, and1Right)

      const expectedPrintOut = ''
        + 'and\n'
        + '    7 > DATA_SOURCE\n'
        + '    or\n'
        + '        10 == DATA_SOURCE\n'
        + '        5 <= DATA_SOURCE\n'
        + '    80 >= DATA_SOURCE\n'
        + '    or\n'
        + '        20 == DATA_SOURCE\n'
        + '        24 <= DATA_SOURCE\n'

      ConditionPrinter.print(condition)
      expect(spy).toHaveBeenCalledWith(expectedPrintOut)
    })
  })
})
