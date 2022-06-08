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
      const id1 = 'eventDispatcher_1'
      const id2 = 'eventDispatcher_2'
      const workflow = WorkflowGenerator.generate({
        elements: {
          eventDispatchers: [
            EndEventDispatcher.create({ id: id1 }),
            EndEventDispatcher.create({ id: id2 }),
          ],
        },
      })

      const { elements: { eventDispatchers } } = EventDispatchers
        .removeEventDispatcher(workflow, id1)

      expect(eventDispatchers).toHaveLength(1)
    })

    describe('when trying to remove the last end event dispatcher', () => {
      it('throws an error', () => {
        const id = 'eventDispatcher_1'
        const workflow = WorkflowGenerator.generate({
          elements: {
            eventDispatchers: [
              EndEventDispatcher.create({ id }),
            ],
          },
        })

        expect(() => EventDispatchers.removeEventDispatcher(workflow, id))
          .toThrow(/Workflow has to contain at least one END event dispatcher/)
      })
    })
  })

  describe('getInterface', () => {
    it('returns the correct interface', () => {
      const data = { type: EndEventDispatcher.TYPE }

      const res = EventDispatchers.getInterface(data)

      expect(res instanceof EndEventDispatcher.constructor).toBe(true)
    })
  })

})
