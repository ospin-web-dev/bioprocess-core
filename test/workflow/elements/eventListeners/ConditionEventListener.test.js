const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('ApprovalEventListener', () => {

  /* eslint-disable */
  testAddMethod(ApprovalEventListener)
  testRemoveMethod(ApprovalEventListener)
  /* eslint-enable */

})
