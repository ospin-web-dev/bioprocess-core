const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const EventListeners = require('../../../../src/workflow/elements/eventListeners/EventListeners')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')

describe('EventListeners', () => {

  /* eslint-disable-next-line */
  testCollectionDefaultGetters(EventListeners, ApprovalEventListener.add)

})
