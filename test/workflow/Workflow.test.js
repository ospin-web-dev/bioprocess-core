const Workflow = require('../../src/workflow/Workflow')

const EndEventDispatcher = require('../../src/workflow/elements/eventDispatchers/EndEventDispatcher')

const ApprovalEventListener = require('../../src/workflow/elements/eventListeners/ApprovalEventListener')
const ConditionEventListener = require('../../src/workflow/elements/eventListeners/ConditionEventListener')
const StartEventListener = require('../../src/workflow/elements/eventListeners/StartEventListener')
const TimerEventListener = require('../../src/workflow/elements/eventListeners/TimerEventListener')

const Flow = require('../../src/workflow/elements/flows/Flow')

const AndMergeGateway = require('../../src/workflow/elements/gateways/AndMergeGateway')
const AndSplitGateway = require('../../src/workflow/elements/gateways/AndSplitGateway')
const LoopGateway = require('../../src/workflow/elements/gateways/LoopGateway')
const OrSplitGateway = require('../../src/workflow/elements/gateways/OrSplitGateway')

const Phase = require('../../src/workflow/elements/phases/Phase')

const WorkflowGenerator = require('../helpers/generators/WorkflowGenerator')

describe('Workflow', () => {
  describe('validateSchema', () => {
    describe('when used with valid data', () => {
      it('does NOT throw an error', () => {
        const data = WorkflowGenerator.generate({
          elements: {
            eventDispatchers: [
              EndEventDispatcher.create({ id: 'endEventDispatcher_1' }),
            ],

            eventListeners: [
              ApprovalEventListener.create({ id: 'eventListener_1' }),
              ConditionEventListener.create({ id: 'eventListener_2' }),
              StartEventListener.create({ id: 'eventListener_3' }),
              TimerEventListener.create({ id: 'eventListener_4' }),
            ],

            flows: [
              Flow.create({ id: 'flow_1', srcId: 'eventListener_3', destId: 'phase_1' }),
              Flow.create({ id: 'flow_2', srcId: 'eventListener_2', destId: 'eventDispatcher_1' }),
            ],

            gateways: [
              AndMergeGateway.create({ id: 'gateway_1' }),
              AndSplitGateway.create({ id: 'gateway_2' }),
              LoopGateway.create({ id: 'gateway_3' }),
              OrSplitGateway.create({ id: 'gateway_4' }),
            ],

            phases: [
              Phase.create({ id: 'phase_1' }),
            ],
          },
        })

        expect(() => Workflow.validateSchema(data)).not.toThrow()
      })
    })

    describe('when used with invalid data', () => {
      it('does throw an error', () => {
        const data = WorkflowGenerator.generate()
        data.nodes = []

        expect(() => Workflow.validateSchema(data)).toThrow(/"nodes" is not allowed/)
      })
    })
  })

  describe('when working on elements', () => {
    describe('when working on eventDispatchers', () => {
      describe('addEndEventDispatcher', () => {
        describe('when the data is valid', () => {
          it('adds a new EndEventDispatcher to the workflow', () => {
            const workflow = WorkflowGenerator.generate()

            const { elements: { eventDispatchers } } = Workflow.addEndEventDispatcher(workflow)

            expect(eventDispatchers).toHaveLength(1)
            expect(eventDispatchers[0].type).toBe(EndEventDispatcher.TYPE)
          })
        })

        describe('when the data is invalid', () => {
          it('throw an error', () => {
            const workflow = WorkflowGenerator.generate()

            expect(() => Workflow.addEndEventDispatcher(workflow, { acceptMe: 'senpai' }))
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

          const { elements: { eventDispatchers } } = Workflow.removeEventDispatcher(workflow, id)

          expect(eventDispatchers).toHaveLength(0)
        })
      })

    })

    describe('when working on eventListeners', () => {

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

              const { elements: { eventListeners } } = Workflow[method](workflow)

              expect(eventListeners).toHaveLength(1)
              expect(eventListeners[0].type).toBe(api.TYPE)
            })
          })

          describe('when the data is invalid', () => {
            it('throws an error', () => {
              const workflow = WorkflowGenerator.generate()

              expect(() => Workflow[method](workflow, { acceptMe: 'senpai' }))
                .toThrow(/"acceptMe" is not allowed/)
            })
          })
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

          const { elements: { eventListeners } } = Workflow.removeEventListener(workflow, id)

          expect(eventListeners).toHaveLength(0)
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

            const { elements: { eventListeners } } = Workflow
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

            expect(() => Workflow.updateEventListener(workflow, id, update))
              .toThrow(/"goat" is not allowed/)
          })
        })
      })
    })

    describe('when working on flows', () => {
      describe('addFlow', () => {
        it('adds a new flow to the workflow', () => {
          const srcId = 'eventListener_1'
          const destId = 'phase_1'
          const workflow = WorkflowGenerator.generate()

          const { elements: { flows } } = Workflow.addFlow(workflow, { srcId, destId })

          expect(flows).toHaveLength(1)
          expect(flows[0].srcId).toBe(srcId)
          expect(flows[0].destId).toBe(destId)
        })
      })

      describe('removeFlow', () => {
        it('removes a flow from the workflow', () => {
          const flowId = 'flow_0'
          const srcId = 'eventListener_1'
          const destId = 'phase_1'
          const workflow = WorkflowGenerator.generate({
            elements: {
              flows: [
                Flow.create({ id: flowId, srcId, destId }),
              ],
            },
          })

          const { elements: { flows } } = Workflow.removeFlow(workflow, flowId)

          expect(flows).toHaveLength(0)
        })
      })

      describe('updateFlow', () => {
        describe('when the data is valid', () => {
          it('adds a new flow to the workflow', () => {
            const flowId = 'flow_0'
            const srcId = 'eventListener_1'
            const destId = 'phase_1'
            const newDestId = 'phase_2'
            const workflow = WorkflowGenerator.generate({
              elements: {
                flows: [
                  Flow.create({ id: flowId, srcId, destId }),
                ],
              },
            })

            const { elements: { flows } } = Workflow
              .updateFlow(workflow, flowId, { destId: newDestId })

            expect(flows[0].destId).toBe(newDestId)
          })
        })

        describe('when the data is invalid', () => {
          it('adds a new flow to the workflow', () => {
            const flowId = 'flow_0'
            const srcId = 'eventListener_1'
            const destId = 'phase_1'
            const workflow = WorkflowGenerator.generate({
              elements: {
                flows: [
                  Flow.create({ id: flowId, srcId, destId }),
                ],
              },
            })

            expect(() => Workflow.updateFlow(workflow, flowId, { acceptMe: 'senpai' }))
              .toThrow(/"acceptMe" is not allowed/)
          })
        })
      })
    })

    describe('when working on gateways', () => {

      const addGatewaySetups = [
        { api: AndMergeGateway, method: 'addAndMergeGateway' },
        { api: AndSplitGateway, method: 'addAndSplitGateway' },
        { api: LoopGateway, method: 'addLoopGateway' },
        { api: OrSplitGateway, method: 'addOrSplitGateway' },
      ]

      /* eslint-disable-next-line jest/require-hook */
      addGatewaySetups.forEach(({ api, method }) => {
        describe(`${method}`, () => {
          describe('when the data is valid', () => {
            it(`adds a new ${api.name} to the workflow`, () => {
              const workflow = WorkflowGenerator.generate()

              const { elements: { gateways } } = Workflow[method](workflow)

              expect(gateways).toHaveLength(1)
              expect(gateways[0].type).toBe(api.TYPE)
            })
          })

          describe('when the data is invalid', () => {
            it('throws an error', () => {
              const workflow = WorkflowGenerator.generate()

              expect(() => Workflow[method](workflow, { acceptMe: 'senpai' }))
                .toThrow(/"acceptMe" is not allowed/)
            })
          })
        })
      })

      describe('removeGateway', () => {
        it('removes a gateway from the workflow', () => {
          const id = 'gateway_0'
          const workflow = WorkflowGenerator.generate({
            elements: {
              gateways: [
                LoopGateway.create({ id }),
              ],
            },
          })

          const { elements: { gateways } } = Workflow.removeGateway(workflow, id)

          expect(gateways).toHaveLength(0)
        })
      })

      describe('updateGateway', () => {
        describe('when the data is valid', () => {
          it('updates a gateway on the workflow', () => {
            const id = 'gateway_0'
            const update = { maxIterations: 666 }
            const workflow = WorkflowGenerator.generate({
              elements: {
                gateways: [
                  LoopGateway.create({ id }),
                ],
              },
            })

            const { elements: { gateways } } = Workflow.updateGateway(workflow, id, update)

            expect(gateways[0].maxIterations).toBe(update.maxIterations)
          })
        })

        describe('when the data is invalid', () => {
          it('throws an error', () => {
            const id = 'gateway_0'
            const workflow = WorkflowGenerator.generate({
              elements: {
                gateways: [
                  LoopGateway.create({ id }),
                ],
              },
            })

            expect(() => Workflow.updateGateway(workflow, id, { acceptMe: 'senpai' }))
              .toThrow(/"acceptMe" is not allowed/)
          })
        })
      })
    })

    describe('when working on phases', () => {
      describe('addPhase', () => {
        describe('when the data is valid', () => {
          it('adds a new phase to the workflow', () => {
            const workflow = WorkflowGenerator.generate()

            const { elements: { phases } } = Workflow.addPhase(workflow)

            expect(phases).toHaveLength(1)
          })
        })

        describe('when the data is invalid', () => {
          it('throws an error', () => {
            const workflow = WorkflowGenerator.generate()

            expect(() => Workflow.addPhase(workflow, { acceptMe: 'senpai' }))
              .toThrow(/"acceptMe" is not allowed/)
          })
        })
      })

      describe('removePhase', () => {
        it('removes a phase from the workflow', () => {
          const id = 'phase_0'
          const workflow = WorkflowGenerator.generate({
            elements: {
              phases: [
                Phase.create({ id }),
              ],
            },
          })

          const { elements: { phases } } = Workflow.removePhase(workflow, id)

          expect(phases).toHaveLength(0)
        })
      })

      describe('updatePhase', () => {
        describe('when the data is valid', () => {
          it('updates a phase on the workflow', () => {
            const id = 'phase_0'
            const update = { commands: [ 'START' ] }
            const workflow = WorkflowGenerator.generate({
              elements: {
                phases: [
                  Phase.create({ id }),
                ],
              },
            })

            const { elements: { phases } } = Workflow
              .updatePhase(workflow, id, update)

            expect(phases[0].commands).toHaveLength(1)
          })
        })

        describe('when the data is invalid', () => {
          it('throws an error', () => {
            const id = 'phase_0'
            const workflow = WorkflowGenerator.generate({
              elements: {
                phases: [
                  Phase.create({ id }),
                ],
              },
            })

            expect(() => Workflow.updatePhase(workflow, id, { acceptMe: 'senpai' }))
              .toThrow(/"acceptMe" is not allowed/)
          })
        })
      })
    })
  })

  describe('updateElement', () => {
    it('updates only the passed element', () => {
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id: 'phase_0' }),
            Phase.create({ id: 'phase_1' }),
          ],
        },
      })

      const updatedElements = Workflow
        .updateElement(workflow.elements.phases, { id: 'phase_0', newKey: 'test' })

      expect(updatedElements[0].newKey).toBe('test')
      expect(updatedElements[1].newKey).toBeUndefined()
    })
  })

  describe('generateUniqeId', () => {
    it('returns a unique Id with the passed prefix', () => {
      const id = 'phase_0'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id }),
          ],
        },
      })

      const newPhaseId = Workflow.generateUniqueId(workflow, 'phase')
      expect(newPhaseId).not.toBe(id)
    })
  })
})
