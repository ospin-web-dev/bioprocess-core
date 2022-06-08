const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('../../../../src/workflow/elements/eventListeners/ConditionEventListener')
const StartEventListener = require('../../../../src/workflow/elements/eventListeners/StartEventListener')
const TimerEventListener = require('../../../../src/workflow/elements/eventListeners/TimerEventListener')

const EventListeners = require('../../../../src/workflow/elements/eventListeners/EventListeners')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('EventListeners', () => {
  const addEventListenerSetups = [
    { api: ApprovalEventListener, method: 'addApprovalEventListener' },
    { api: ConditionEventListener, method: 'addConditionEventListener' },
    { api: StartEventListener, method: 'addStartEventListener' },
    { api: TimerEventListener, method: 'addTimerEventListener' },
  ]

  /* eslint-disable-next-line jest/require-hook */
  addEventListenerSetups.forEach(({ api, method }) => {
    describe(`${method}`, () => {
      describe('when the data is valid', () => {
        it(`adds a new ${api.name} to the workflow`, () => {
          const workflow = WorkflowGenerator.generate()

          const { elements: { eventListeners } } = EventListeners[method](workflow)

          expect(eventListeners).toHaveLength(1)
          expect(eventListeners[0].type).toBe(api.TYPE)
          expect(eventListeners[0].id).toBe('eventListener_0')
        })
      })

      describe('when the data is invalid', () => {
        it('throws an error', () => {
          const workflow = WorkflowGenerator.generate()

          expect(() => EventListeners[method](workflow, { acceptMe: 'senpai' }))
            .toThrow(/"acceptMe" is not allowed/)
        })
      })
    })
  })

  describe('when trying to add a second start event listener', () => {
    it('throws an error', () => {
      const wf = WorkflowGenerator.generate()
      const wfWithOneStartEventListener = EventListeners.addStartEventListener(wf)

      expect(() => EventListeners.addStartEventListener(wfWithOneStartEventListener))
        .toThrow(/Workflow has to contain exactly one START event listener/)
    })
  })

  describe('removeEventListener', () => {
    it('removes an event listener from a workflow', () => {
      const id = 'eventListener_1'
      const workflow = WorkflowGenerator.generate({
        elements: {
          eventListeners: [
            ApprovalEventListener.create({ id }),
          ],
        },
      })

      const { elements: { eventListeners } } = EventListeners.removeEventListener(workflow, id)

      expect(eventListeners).toHaveLength(0)
    })

    describe('when trying to remove the START event listener', () => {
      it('throw an error', () => {
        const id = 'eventListener_1'
        const workflow = WorkflowGenerator.generate({
          elements: {
            eventListeners: [
              StartEventListener.create({ id }),
            ],
          },
        })

        expect(() => EventListeners.removeEventListener(workflow, id))
          .toThrow(/Workflow has to contain exactly one START event listener/)
      })
    })
  })

  describe('updateEventListener', () => {
    describe('when the data is valid', () => {
      it('updates the data of an event listener', () => {
        const id = 'eventListener_1'
        const update = { durationInMS: 666 }
        const workflow = WorkflowGenerator.generate({
          elements: {
            eventListeners: [
              TimerEventListener.create({ id }),
            ],
          },
        })

        const { elements: { eventListeners } } = EventListeners
          .updateEventListener(workflow, id, update)

        expect(eventListeners[0].durationInMS).toBe(update.durationInMS)
      })
    })

    describe('when the data is invalid', () => {
      it('throws an error', () => {
        const id = 'eventListener_1'
        const update = { goat: 666 }
        const workflow = WorkflowGenerator.generate({
          elements: {
            eventListeners: [
              TimerEventListener.create({ id }),
            ],
          },
        })

        expect(() => EventListeners.updateEventListener(workflow, id, update))
          .toThrow(/"goat" is not allowed/)
      })
    })
  })
})
