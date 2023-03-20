const OrGateway = require('../../../../src/workflow/elements/gateways/OrGateway')
const testAddMethod = require('../helpers/testAddMethod')
const testRemoveMethod = require('../helpers/testRemoveMethod')

describe('OrGateway', () => {

  /* eslint-disable */
  testAddMethod(OrGateway)
  testRemoveMethod(OrGateway)
  /* eslint-enable */

})
