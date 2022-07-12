const EventDispatchers = require('../../../../src/workflow/elements/eventDispatchers/EventDispatchers')
const EndEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/EndEventDispatcher')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')

describe('EventDispatchers', () => {

  /* eslint-disable-next-line */
  testCollectionDefaultGetters(EventDispatchers, EndEventDispatcher.add)

})
