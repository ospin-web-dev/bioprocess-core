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

      expect(res.operator).toBe('AND')
      expect(res.left).toStrictEqual(condition)
      expect(res.right).toStrictEqual({ operator: null, left: null, right: null, options: {} })
    })

    it('wraps a condition into a new AND condition and adds second provided condition', () => {
      const condition1 = createSimpleCondition()
      const condition2 = createSimpleCondition()
      const res = Condition.wrapInAnd(condition1, condition2)

      expect(res.operator).toBe('AND')
      expect(res.left).toStrictEqual(condition1)
      expect(res.right).toStrictEqual(condition2)
    })
  })

  describe('wrapInOr', () => {
    it('wraps a condition into a new OR condition and adds another empty condition', () => {
      const condition = createSimpleCondition()
      const res = Condition.wrapInOr(condition)

      expect(res.operator).toBe('OR')
      expect(res.left).toStrictEqual(condition)
      expect(res.right).toStrictEqual({ operator: null, left: null, right: null, options: {} })
    })

    it('wraps a condition into a new OR condition and adds second provided condition', () => {
      const condition1 = createSimpleCondition()
      const condition2 = createSimpleCondition()
      const res = Condition.wrapInOr(condition1, condition2)

      expect(res.operator).toBe('OR')
      expect(res.left).toStrictEqual(condition1)
      expect(res.right).toStrictEqual(condition2)
    })
  })

  describe('parseFromASTToGroupRepresentation', () => {
    it('parses the first example correctly into a condition with group representation', () => {
      const example = {
        operator: '<',
        left: 2,
        right: {
          dataSource: {
            type: DataSource.TYPES.SENSOR_DATA,
            data: { fctId: '1', slotName: 'value' },
          },
        },
      }

      const expectedResult = {
        group: false,
        operator: '<',
        left: 2,
        right: {
          dataSource: {
            type: DataSource.TYPES.SENSOR_DATA,
            data: { fctId: '1', slotName: 'value' },
          },
        },
      }

      const res = Condition.parseFromASTToGroupRepresentation(example)

      expect(res).toStrictEqual(expectedResult)
    })

    it('parses the second example correctly into a condition with group representation', () => {
      const example1 = {
        operator: 'OR',
        left: {
          operator: '<',
          left: 2,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '1', slotName: 'value' },
            },
          },
        },
        right: {
          operator: '<',
          left: 3,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '2', slotName: 'value' },
            },
          },
        },
      }

      const expectedResult = {
        group: true,
        operator: 'OR',
        conditions: [
          {
            group: false,
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '1', slotName: 'value' },
              },
            },
          },
          {
            group: false,
            operator: '<',
            left: 3,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '2', slotName: 'value' },
              },
            },
          },
        ],
      }

      const res = Condition.parseFromASTToGroupRepresentation(example1)

      expect(res).toStrictEqual(expectedResult)
    })

    it('parses the third example correctly into a condition with group representation', () => {
      const example = {
        operator: 'OR',
        left: {
          operator: 'OR',
          left: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '1', slotName: 'value' },
              },
            },
          },
          right: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '2', slotName: 'value' },
              },
            },
          },
        },
        right: {
          operator: '<',
          left: 3,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '3', slotName: 'value' },
            },
          },
        },
      }

      const expectedResult = {
        group: true,
        operator: 'OR',
        conditions: [
          {
            group: false,
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '1', slotName: 'value' },
              },
            },
          },
          {
            group: false,
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '2', slotName: 'value' },
              },
            },
          },
          {
            group: false,
            operator: '<',
            left: 3,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '3', slotName: 'value' },
              },
            },
          },
        ],
      }

      const res = Condition.parseFromASTToGroupRepresentation(example)

      expect(res).toStrictEqual(expectedResult)
    })

    it('parses the fourth example correctly into a condition with group representation', () => {
      const example = {
        operator: 'OR',
        left: {
          operator: 'AND',
          left: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '1', slotName: 'value' },
              },
            },
          },
          right: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '2', slotName: 'value' },
              },
            },
          },
        },
        right: {
          operator: '<',
          left: 3,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '3', slotName: 'value' },
            },
          },
        },
      }

      const expectedResult = {
        group: true,
        operator: 'OR',
        conditions: [
          {
            group: true,
            operator: 'AND',
            conditions: [
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '1', slotName: 'value' },
                  },
                },
              },
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '2', slotName: 'value' },
                  },
                },
              },
            ],
          },
          {
            group: false,
            operator: '<',
            left: 3,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '3', slotName: 'value' },
              },
            },
          },
        ],
      }

      const res = Condition.parseFromASTToGroupRepresentation(example)

      expect(res).toStrictEqual(expectedResult)
    })

    it('parses the fiths example correctly into a condition with group representation', () => {
      const example = {
        operator: 'OR',
        left: {
          operator: 'AND',
          left: {
            operator: 'AND',
            left: {
              operator: '<',
              left: 2,
              right: {
                dataSource: {
                  type: DataSource.TYPES.SENSOR_DATA,
                  data: { fctId: '1', slotName: 'value' },
                },
              },
            },
            right: {
              operator: '<',
              left: 2,
              right: {
                dataSource: {
                  type: DataSource.TYPES.SENSOR_DATA,
                  data: { fctId: '2', slotName: 'value' },
                },
              },
            },
          },
          right: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '3', slotName: 'value' },
              },
            },
          },
        },
        right: {
          operator: '<',
          left: 3,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '4', slotName: 'value' },
            },
          },
        },
      }

      const expectedResult = {
        group: true,
        operator: 'OR',
        conditions: [
          {
            group: true,
            operator: 'AND',
            conditions: [
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '1', slotName: 'value' },
                  },
                },
              },
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '2', slotName: 'value' },
                  },
                },
              },
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '3', slotName: 'value' },
                  },
                },
              },
            ],
          },
          {
            group: false,
            operator: '<',
            left: 3,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '4', slotName: 'value' },
              },
            },
          },
        ],
      }

      const res = Condition.parseFromASTToGroupRepresentation(example)

      expect(res).toStrictEqual(expectedResult)
    })

    it('parses the sixth example correctly into a condition with group representation', () => {
      const example = {
        operator: 'OR',
        left: {
          operator: 'AND',
          left: {
            operator: 'AND',
            left: {
              operator: 'OR',
              left: {
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '1', slotName: 'value' },
                  },
                },
              },
              right: {
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '2', slotName: 'value' },
                  },
                },
              },
            },
            right: {
              operator: '<',
              left: 2,
              right: {
                dataSource: {
                  type: DataSource.TYPES.SENSOR_DATA,
                  data: { fctId: '3', slotName: 'value' },
                },
              },
            },
          },
          right: {
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '4', slotName: 'value' },
              },
            },
          },
        },
        right: {
          operator: '<',
          left: 2,
          right: {
            dataSource: {
              type: DataSource.TYPES.SENSOR_DATA,
              data: { fctId: '5', slotName: 'value' },
            },
          },
        },
      }

      const expectedResult = {
        group: true,
        operator: 'OR',
        conditions: [
          {
            operator: 'AND',
            group: true,
            conditions: [
              {
                group: true,
                operator: 'OR',
                conditions: [
                  {
                    group: false,
                    operator: '<',
                    left: 2,
                    right: {
                      dataSource: {
                        type: DataSource.TYPES.SENSOR_DATA,
                        data: { fctId: '1', slotName: 'value' },
                      },
                    },
                  },
                  {
                    group: false,
                    operator: '<',
                    left: 2,
                    right: {
                      dataSource: {
                        type: DataSource.TYPES.SENSOR_DATA,
                        data: { fctId: '2', slotName: 'value' },
                      },
                    },
                  },
                ],
              },
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '3', slotName: 'value' },
                  },
                },
              },
              {
                group: false,
                operator: '<',
                left: 2,
                right: {
                  dataSource: {
                    type: DataSource.TYPES.SENSOR_DATA,
                    data: { fctId: '4', slotName: 'value' },
                  },
                },
              },
            ],
          },
          {
            group: false,
            operator: '<',
            left: 2,
            right: {
              dataSource: {
                type: DataSource.TYPES.SENSOR_DATA,
                data: { fctId: '5', slotName: 'value' },
              },
            },
          },
        ],
      }

      const res = Condition.parseFromASTToGroupRepresentation(example)

      expect(res).toStrictEqual(expectedResult)
    })
  })
})
