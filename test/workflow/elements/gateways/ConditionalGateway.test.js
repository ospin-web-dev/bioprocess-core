const ConditionalGateway = require('../../../../src/workflow/elements/gateways/ConditionalGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')

describe('ConditionalGateway', () => {

  /* eslint-disable */
  testAddMethod(ConditionalGateway)
  testRemoveMethod(ConditionalGateway)
  testUpdateMethod(ConditionalGateway, undefined, { falseFlowId: 'flow_0', trueFlowId: 'flow_1' })
  /* eslint-enable */

})
