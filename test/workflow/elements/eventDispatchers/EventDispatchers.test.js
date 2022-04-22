const EndEventDispatcher = require('../../../../src/workflow/elements/eventDispatchers/EndEventDispatcher')
const EventDispatchers = require('../../../../src/workflow/elements/eventDispatchers/EventDispatchers')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('EventDispatchers', () => {
  describe('addEndEventDispatcher', () => {
    describe('when the data is valid', () => {
      it('adds a new EndEventDispatcher to the workflow', () => {
        const workflow = WorkflowGenerator.generate()

        const { elements: { eventDispatchers } } = EventDispatchers.addEndEventDispatcher(workflow)

        expect(eventDispatchers).toHaveLength(1)
        expect(eventDispatchers[0].type).toBe(EndEventDispatcher.TYPE)
        expect(eventDispatchers[0].id).toBe('eventDispatcher_0')
      })
    })

    describe('when the data is invalid', () => {
      it('throw an error', () => {
        const workflow = WorkflowGenerator.generate()

        expect(() => EventDispatchers.addEndEventDispatcher(workflow, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

  describe('removeEventDispatcher', () => {
    it('removes a EndEventDispatcher from the workflow', () => {
      const id = 'eventDispatcher_1'
      const workflow = WorkflowGenerator.generate({
        elements: {
          eventDispatchers: [
            EndEventDispatcher.create({ id }),
          ],
        },
      })

      const { elements: { eventDispatchers } } = EventDispatchers
        .removeEventDispatcher(workflow, id)

      expect(eventDispatchers).toHaveLength(0)
    })
  })

})
