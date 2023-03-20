const AndGateway = require('../../../../src/workflow/elements/gateways/AndGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('AndGateway', () => {

  /* eslint-disable */
  testAddMethod(AndGateway)
  testRemoveMethod(AndGateway)
  /* eslint-enable */

})
