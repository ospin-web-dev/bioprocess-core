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
      const res = Condition.create(null, { left: null, right: null })
      expect(res).toStrictEqual(expect
        .objectContaining({ left: null, right: null, operator: null, options: {} }))
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
      const res = Condition.create(null, { operator, left, right, options })
      expect(res).toStrictEqual(expect.objectContaining({ operator, left, right, options }))
    })

    describe('when "conditions" and "left" is provided', () => {
      it('throws an error when conditions AND left is provided', () => {
        const left = {
          dataSource: {
            type: DataSource.TYPES.SENSOR_DATA,
            data: { fctId: '1', slotName: 'value' },
          },
        }
        const conditions = []
        expect(() => Condition.create(null, { left, conditions })).toThrow(/conflict between exclusive peers/)
      })
    })

    describe('when "conditions" and "right" is provided', () => {
      it('throws an error when conditions AND left is provided', () => {
        const right = {
          dataSource: {
            type: DataSource.TYPES.SENSOR_DATA,
            data: { fctId: '1', slotName: 'value' },
          },
        }
        const conditions = []
        expect(() => Condition.create(null, { right, conditions })).toThrow(/conflict between exclusive peers/)
      })
    })
  })

  describe('getAllConditionIds', () => {
    it('returns all conditionIds within a condition', () => {
      const rootCondition = {
        id: 'condition_0',
        operator: 'AND',
        conditions: [
          {
            id: 'condition_1',
            operator: 'OR',
            conditions: [
              {
                id: 'condition_2',
                operator: '<=',
                left: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '1', slotName: 'value' },
                  },
                },
                right: 12,
              },
              {
                id: 'condition_3',
                operator: '<=',
                left: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '2', slotName: 'value' },
                  },
                },
                right: 1,
              },
            ],
          },
        ],
      }

      const res = Condition.getAllConditionIds(rootCondition)
      expect(res)
        .toStrictEqual(expect.arrayContaining(['condition_0', 'condition_1', 'condition_2', 'condition_3']))
    })
  })

  describe('createRootCondition', () => {
    it('creates a new AND condition with an empty condition array', () => {
      const root = Condition.createRootCondition()

      expect(root.id).toStrictEqual(expect.any(String))
      expect(root.operator).toBe('AND')
      expect(root.conditions).toStrictEqual([])
    })
  })

  describe('addConditionToGroup', () => {
    it('should add a new condition to an existing group', () => {
      const root = Condition.createRootCondition()
      const updatedCon = Condition.addConditionToGroup(root, root.id)

      expect(updatedCon.conditions).toHaveLength(1)
    })
  })

  describe('addGroupToGroup', () => {
    it('should add a new condition to an existing group', () => {
      const root = Condition.createRootCondition()
      const updatedCon = Condition.addGroupToGroup(root, root.id)

      expect(updatedCon.conditions).toHaveLength(1)
      expect(updatedCon.conditions[0].operator).toBe(Condition.OPERATORS.AND)
      expect(updatedCon.conditions[0].conditions).toStrictEqual([])
    })
  })

  describe('setOperator', () => {
    it('should set a new operator to an existing condition', () => {
      const root = Condition.createRootCondition()
      const updatedCon = Condition.setOperator(root, root.id, Condition.OPERATORS.OR)

      expect(updatedCon.operator).toBe(Condition.OPERATORS.OR)
    })
  })

  describe('setLeft', () => {
    it('should set a new operator to an existing condition', () => {
      const root = Condition.createRootCondition()
      const newLeft = Math.random()
      const updatedCon = Condition.addConditionToGroup(root, root.id)
      const resCon = Condition.setLeft(updatedCon, updatedCon.conditions[0].id, newLeft)

      expect(resCon.conditions[0].left).toBe(newLeft)
    })
  })

  describe('setRight', () => {
    it('should set a new operator to an existing condition', () => {
      const root = Condition.createRootCondition()
      const newRight = Math.random()
      const updatedCon = Condition.addConditionToGroup(root, root.id)
      const resCon = Condition.setRight(updatedCon, updatedCon.conditions[0].id, newRight)

      expect(resCon.conditions[0].right).toBe(newRight)
    })
  })

  describe('deleteConditionFromGroup', () => {
    describe('when removing a normal condition', () => {
      it('should remove a condition from the group', () => {
        const root = Condition.createRootCondition()
        const updatedCon = Condition.addConditionToGroup(root, root.id)
        const resCon = Condition.deleteConditionFromGroup(updatedCon, updatedCon.conditions[0].id)

        expect(resCon.conditions).toHaveLength(0)
      })
    })

    describe('when removing a group', () => {
      it('should remove a group from the group', () => {
        const root = Condition.createRootCondition()
        const updatedCon = Condition.addGroupToGroup(root, root.id)
        const resCon = Condition.deleteConditionFromGroup(updatedCon, updatedCon.conditions[0].id)

        expect(resCon.conditions).toHaveLength(0)
      })
    })
  })

})
