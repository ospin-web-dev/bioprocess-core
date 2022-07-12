const LoopGateway = require('../../../../src/workflow/elements/gateways/LoopGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')

describe('LoopGateway', () => {

  /* eslint-disable */
  testAddMethod(LoopGateway)
  testRemoveMethod(LoopGateway)
  testUpdateMethod(LoopGateway, undefined, { loopbackFlowId: 'flow_0' })
  /* eslint-enable */

})
