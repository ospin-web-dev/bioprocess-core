const StartEventListener = require('../../../../src/workflow/elements/eventListeners/StartEventListener')
const testAddMethod = require('../helpers/testAddMethod')
const testUpdateMethod = require('../helpers/testUpdateMethod')
const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('StartEventListener', () => {

  /* eslint-disable */
  testAddMethod(StartEventListener)
  testUpdateMethod(StartEventListener, undefined, { phaseId: 'phase_0' })
  /* eslint-enable */

  describe('when trying to add a second start listener', () => {
    it('throws an error', () => {
      let wf = WorkflowGenerator.generate()

      wf = StartEventListener.add(wf)

      expect(() => StartEventListener.add(wf)).toThrow(/exactly one START event listener/)
    })
  })

})
