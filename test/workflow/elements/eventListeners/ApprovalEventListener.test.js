const ConditionEventListener = require('../../../../src/workflow/elements/eventListeners/ConditionEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const Condition = require('../../../../src/conditions/Condition')

describe('ConditionEventListener', () => {

  /* eslint-disable */
  testAddMethod(ConditionEventListener, { condition: Condition.createRootCondition() })
  testRemoveMethod(ConditionEventListener, { condition: Condition.createRootCondition() })
  /* eslint-enable */

})
