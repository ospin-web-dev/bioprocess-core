const TimerEventListener = require('../../../../src/workflow/elements/eventListeners/TimerEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')

describe('TimerEventListener', () => {

  /* eslint-disable */
  testAddMethod(TimerEventListener)
  testRemoveMethod(TimerEventListener)
  testUpdateMethod(TimerEventListener, undefined, { phaseId: 'phase_0' })
  /* eslint-enable */

})
