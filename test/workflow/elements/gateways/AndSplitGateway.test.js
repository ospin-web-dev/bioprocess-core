const AndSplitGateway = require('../../../../src/workflow/elements/gateways/AndSplitGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('AndSplitGateway', () => {

  /* eslint-disable */
  testAddMethod(AndSplitGateway)
  testRemoveMethod(AndSplitGateway)
  /* eslint-enable */

})
