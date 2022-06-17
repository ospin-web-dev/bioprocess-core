const EndEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/EndEventDispatcher')
const Flows = require('../../../../src/workflow/elements/flows/Flows')
const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

const testAddMethod = require('../helpers/testAddMethod')

describe('EndEventDispatcher', () => {

  /* eslint-disable */
  testAddMethod(EndEventDispatcher)
  /* eslint-enable */

  describe('remove', () => {
    it('removes an EndEventDispatcher from the workflow', () => {
      let wf = WorkflowGenerator.generate()
      wf = EndEventDispatcher.add(wf)
      wf = EndEventDispatcher.add(wf)

      const dispatcher = EndEventDispatcher.getAll(wf)[0]

      const { elements: { eventDispatchers } } = EndEventDispatcher.remove(wf, dispatcher.id)

      expect(eventDispatchers).toHaveLength(1)
    })

    describe('when trying to remove the last end event dispatcher', () => {
      it('throws an error', () => {
        let wf = WorkflowGenerator.generate()
        wf = EndEventDispatcher.add(wf)
        const dispatcher = EndEventDispatcher.getAll(wf)[0]

        expect(() => EndEventDispatcher.remove(wf, dispatcher.id))
          .toThrow(/Workflow has to contain at least one END event dispatcher/)
      })
    })

    it('removes all attached flows', () => {
      let wf = WorkflowGenerator.generate()
      wf = EndEventDispatcher.add(wf)
      wf = EndEventDispatcher.add(wf)
      wf = ApprovalEventListener.add(wf)
      const dispatcher = EndEventDispatcher.getAll(wf)[0]
      wf = Flows.add(wf, { srcId: ApprovalEventListener.getAll(wf)[0].id, destId: dispatcher.id })

      wf = EndEventDispatcher.remove(wf, dispatcher.id)

      expect(Flows.getAll(wf)).toHaveLength(0)
    })
  })
})
