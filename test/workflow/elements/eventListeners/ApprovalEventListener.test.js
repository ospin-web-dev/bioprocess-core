const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')

describe('ApprovalEventListener', () => {

  /* eslint-disable */
  testAddMethod(ApprovalEventListener)
  testRemoveMethod(ApprovalEventListener)
  testUpdateMethod(ApprovalEventListener, undefined, { phaseId: 'phase_0' })
  /* eslint-enable */

})
