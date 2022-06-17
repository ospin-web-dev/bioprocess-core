const EndEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/EndEventDispatcher')
const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('EventDispatchers', () => {

  describe('add', () => {
    describe('when the data is valid', () => {
      it('adds a new EndEventDispatcher to the workflow', () => {
        const workflow = WorkflowGenerator.generate()

        const { elements: { eventDispatchers } } = EndEventDispatcher.add(workflow)

        expect(eventDispatchers).toHaveLength(1)
        expect(eventDispatchers[0].type).toBe(EndEventDispatcher.TYPE)
        expect(eventDispatchers[0].id).toBe('eventDispatcher_0')
      })
    })

    describe('when the data is invalid', () => {
      it('throw an error', () => {
        const workflow = WorkflowGenerator.generate()

        expect(() => EndEventDispatcher.add(workflow, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

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
  })
})
