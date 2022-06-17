const TimerEventListener = require('../../../../src/workflow/elements/eventListeners/TimerEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('TimerEventListener', () => {

  /* eslint-disable */
  testAddMethod(TimerEventListener)
  testRemoveMethod(TimerEventListener)
  /* eslint-enable */

})
