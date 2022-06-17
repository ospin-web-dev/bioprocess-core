const LoopGateway = require('../../../../src/workflow/elements/gateways/LoopGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('LoopGateway', () => {

  /* eslint-disable */
  testAddMethod(LoopGateway)
  testRemoveMethod(LoopGateway)
  /* eslint-enable */

})
