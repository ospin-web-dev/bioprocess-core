const AlertEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/AlertEventDispatcher')
const Flows = require('../../../../src/workflow/elements/flows/Flows')
const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

const testAddMethod = require('../helpers/testAddMethod')

describe('AlertEventDispatcher', () => {

  /* eslint-disable */
  testAddMethod(AlertEventDispatcher)
  /* eslint-enable */

  describe('remove', () => {
    it('removes an AlertEventDispatcher from the workflow', () => {
      let wf = WorkflowGenerator.generate()
      wf = AlertEventDispatcher.add(wf)
      wf = AlertEventDispatcher.add(wf)

      const dispatcher = AlertEventDispatcher.getAll(wf)[0]

      const { elements: { eventDispatchers } } = AlertEventDispatcher.remove(wf, dispatcher.id)

      expect(eventDispatchers).toHaveLength(1)
    })

    it('removes all attached flows', () => {
      let wf = WorkflowGenerator.generate()
      wf = AlertEventDispatcher.add(wf)
      wf = AlertEventDispatcher.add(wf)
      wf = ApprovalEventListener.add(wf)
      const dispatcher = AlertEventDispatcher.getAll(wf)[0]
      wf = Flows.add(wf, { srcId: ApprovalEventListener.getAll(wf)[0].id, destId: dispatcher.id })

      wf = AlertEventDispatcher.remove(wf, dispatcher.id)

      expect(Flows.getAll(wf)).toHaveLength(0)
    })
  })

})
