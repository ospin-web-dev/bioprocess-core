const AndGateway = require('../../../../src/workflow/elements/gateways/AndGateway')
const Gateways = require('../../../../src/workflow/elements/gateways/Gateways')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')

describe('Gateways', () => {

  /* eslint-disable-next-line */
  testCollectionDefaultGetters(Gateways, AndGateway.add)

})
