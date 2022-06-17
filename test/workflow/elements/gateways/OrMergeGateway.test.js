const OrMergeGateway = require('../../../../src/workflow/elements/gateways/OrMergeGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('OrMergeGateway', () => {

  /* eslint-disable */
  testAddMethod(OrMergeGateway)
  testRemoveMethod(OrMergeGateway)
  /* eslint-enable */

})
