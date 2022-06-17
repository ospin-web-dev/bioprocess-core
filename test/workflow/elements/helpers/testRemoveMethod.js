const Flows = require('../../../../src/workflow/elements/flows/Flows')
const EndEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/EndEventDispatcher')
const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

/* eslint-disable jest/no-export */
module.exports = (elementInterface, defaultData = {}) => {
  describe('remove', () => {
    it('removes an element from the workflow', () => {
      let wf = WorkflowGenerator.generate()
      wf = elementInterface.add(wf, defaultData)
      const listener = elementInterface.getAll(wf)[0]

      const { elements: { eventListeners } } = elementInterface.remove(wf, listener.id)

      expect(eventListeners).toHaveLength(0)
    })

    it('removes all attached flows', () => {
      let wf = WorkflowGenerator.generate()
      wf = EndEventDispatcher.add(wf)
      wf = elementInterface.add(wf, defaultData)
      const listener = elementInterface.getAll(wf)[0]
      const dispatcher = EndEventDispatcher.getAll(wf)[0]
      wf = Flows.add(wf, { srcId: listener.id, destId: dispatcher.id })

      wf = elementInterface.remove(wf, dispatcher.id)

      expect(Flows.getAll(wf)).toHaveLength(0)
    })
  })
}
