const Condition = require('../../src/conditions/Condition')
const DataSource = require('../../src/conditions/dataSources/DataSource')

describe('the Condition interface', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  const createSimpleCondition = () => {
    const operator = '<'
    const left = 10
    const right = {
      dataSource: {
        type: DataSource.TYPES.SENSOR_DATA,
        data: { fctId: '1', slotName: 'value' },
      },
    }
    const options = { consecutiveTimeMS: 1000, allowedDeviation: 0.5 }
    return Condition.create({ operator, left, right, options })
  }

  describe('create', () => {
    it('creates a condition with the unset values when no arguments are passed', () => {
      const res = Condition.create()
      expect(res).toStrictEqual({ operator: null, left: null, right: null, options: {} })
    })

    it('creates a condition with the set values when arguments are passed', () => {
      const operator = '<'
      const left = 10
      const right = {
        dataSource: {
          type: DataSource.TYPES.SENSOR_DATA,
          data: { fctId: '1', slotName: 'value' },
        },
      }
      const options = { consecutiveTimeMS: Math.random(), allowedDeviation: Math.random() }
      const res = Condition.create({ operator, left, right, options })
      expect(res).toStrictEqual({ operator, left, right, options })
    })
  })

  describe('setLeft', () => {
    it('sets the left value of a condition', () => {
      const condition = createSimpleCondition()
      const newLeft = Math.random()
      const res = Condition.setLeft(condition, newLeft)
      expect(res.left).toStrictEqual(newLeft)
    })
  })

  describe('setRight', () => {
    it('sets the right value of a condition', () => {
      const condition = createSimpleCondition()
      const newRight = Math.random()
      const res = Condition.setRight(condition, newRight)
      expect(res.right).toStrictEqual(newRight)
    })
  })

  describe('setOperator', () => {
    it('sets the operator of a condition', () => {
      const condition = createSimpleCondition()
      const newOperator = '=='
      const res = Condition.setOperator(condition, newOperator)
      expect(res.operator).toStrictEqual(newOperator)
    })
  })

  describe('setOptions', () => {
    it('sets the options of a condition', () => {
      const condition = createSimpleCondition()
      const newOptions = { allowedDeviation: Math.random(), consecutiveTimeMS: Math.random() }
      const res = Condition.setOptions(condition, newOptions)
      expect(res.options).toStrictEqual(newOptions)
    })
  })

  describe('wrapInAnd', () => {
    it('wraps a condition into a new AND condition and adds another empty condition', () => {
      const condition = createSimpleCondition()
      const res = Condition.wrapInAnd(condition)

      expect(res.operator).toBe('and')
      expect(res.left).toStrictEqual(condition)
      expect(res.right).toStrictEqual({ operator: null, left: null, right: null, options: {} })
    })

    it('wraps a condition into a new AND condition and adds second provided condition', () => {
      const condition1 = createSimpleCondition()
      const condition2 = createSimpleCondition()
      const res = Condition.wrapInAnd(condition1, condition2)

      expect(res.operator).toBe('and')
      expect(res.left).toStrictEqual(condition1)
      expect(res.right).toStrictEqual(condition2)
    })
  })

  describe('wrapInOr', () => {
    it('wraps a condition into a new OR condition and adds another empty condition', () => {
      const condition = createSimpleCondition()
      const res = Condition.wrapInOr(condition)

      expect(res.operator).toBe('or')
      expect(res.left).toStrictEqual(condition)
      expect(res.right).toStrictEqual({ operator: null, left: null, right: null, options: {} })
    })

    it('wraps a condition into a new OR condition and adds second provided condition', () => {
      const condition1 = createSimpleCondition()
      const condition2 = createSimpleCondition()
      const res = Condition.wrapInOr(condition1, condition2)

      expect(res.operator).toBe('or')
      expect(res.left).toStrictEqual(condition1)
      expect(res.right).toStrictEqual(condition2)
    })
  })
})
