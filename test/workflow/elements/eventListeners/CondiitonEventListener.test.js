const ConditionEventListener = require('../../../../src/workflow/elements/eventListeners/ConditionEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')
const Condition = require('../../../../src/conditions/Condition')

describe('ConditionEventListener', () => {

  /* eslint-disable */
  testAddMethod(ConditionEventListener, { condition: Condition.createRootCondition() })
  testRemoveMethod(ConditionEventListener, { condition: Condition.createRootCondition() })
  testUpdateMethod(ConditionEventListener, { condition: Condition.createRootCondition() }, {
    condition: { ...Condition.createRootCondition(), operator: Condition.OPERATORS.OR },
  })
  /* eslint-enable */

})
