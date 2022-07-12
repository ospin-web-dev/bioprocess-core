const AndMergeGateway = require('../../../../src/workflow/elements/gateways/AndMergeGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('AndMergeGateway', () => {

  /* eslint-disable */
  testAddMethod(AndMergeGateway)
  testRemoveMethod(AndMergeGateway)
  /* eslint-enable */

})
