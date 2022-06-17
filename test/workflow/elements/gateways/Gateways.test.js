const AndMergeGateway = require('../../../../src/workflow/elements/gateways/AndMergeGateway')
const Gateways = require('../../../../src/workflow/elements/gateways/Gateways')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')

describe('Gateways', () => {

  /* eslint-disable-next-line */
  testCollectionDefaultGetters(Gateways, AndMergeGateway.add)

})
