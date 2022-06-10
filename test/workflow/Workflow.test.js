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
const OrMergeGateway = require('../../src/workflow/elements/gateways/OrMergeGateway')

const Phase = require('../../src/workflow/elements/phases/Phase')

const WorkflowGenerator = require('../helpers/generators/WorkflowGenerator')

describe('Workflow', () => {
  describe('validateSchema', () => {
    describe('when used with valid data', () => {
      it('does NOT throw an error', () => {
        const data = WorkflowGenerator.generate({
          elements: [
            EndEventDispatcher.create({ id: 'endEventDispatcher_1' }),

            ApprovalEventListener.create({ id: 'eventListener_1' }),
            ConditionEventListener.create({ id: 'eventListener_2' }),
            StartEventListener.create({ id: 'eventListener_3' }),
            TimerEventListener.create({ id: 'eventListener_4' }),

            Flow.create({ id: 'flow_1', srcId: 'eventListener_3', destId: 'phase_1' }),
            Flow.create({ id: 'flow_2', srcId: 'eventListener_2', destId: 'eventDispatcher_1' }),

            AndMergeGateway.create({ id: 'gateway_1' }),
            AndSplitGateway.create({ id: 'gateway_2' }),
            LoopGateway.create({ id: 'gateway_3' }),
            OrMergeGateway.create({ id: 'gateway_4' }),

            Phase.create({ id: 'phase_1' }),
          ],
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

  describe('createTemplate', () => {
    it('creates a workflow and assigns id and version', () => {
      const res = Workflow.createTemplate()

      expect(res.version).toBe(Workflow.DEFAULT_VERSION)
      expect(res.id).toStrictEqual(expect.any(String))
    })

    it('creates a workflow with a START event listener', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventListeners[0].type).toBe(StartEventListener.TYPE)
    })

    it('creates a workflow with an initial phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.phases).toHaveLength(1)
    })

    it('creates a connection from the start event and the initial phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.flows[0].srcId)
        .toBe(res.elements.eventListeners[0].id)
      expect(res.elements.flows[0].destId)
        .toBe(res.elements.phases[0].id)
    })

    it('creates a workflow with an approval event for the first phase', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventListeners[1].type).toBe(ApprovalEventListener.TYPE)
      expect(res.elements.eventListeners[1].phaseId)
        .toBe(res.elements.phases[0].id)
    })

    it('creates a workflow with an END event dispatcher', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventDispatchers).toHaveLength(1)
      expect(res.elements.eventDispatchers[0].type).toBe(EndEventDispatcher.TYPE)
    })

    it('creates a connection from the approval event of the first phase and the END event dispatcher', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.flows[1].srcId)
        .toBe(res.elements.eventListeners[1].id)
      expect(res.elements.flows[1].destId)
        .toBe(res.elements.eventDispatchers[0].id)
    })
  })

  describe('when connecting elements', () => {
    describe('when trying to connect a phase to something else', () => {
      it('throws an error', () => {
        const phaseId1 = 'phase_0'
        const phaseId2 = 'phase_1'
        const wf = WorkflowGenerator.generate({
          elements: {
            eventDispatchers: [],
            eventListeners: [],
            gateways: [],
            phases: [
              Phase.create({ id: phaseId1 }),
              Phase.create({ id: phaseId2 }),
            ],
          },
        })
        expect(() => Workflow.connect(wf, phaseId1, phaseId2))
          .toThrow(/a\(n\) PHASE cannot connect to a PHASE/)
      })
    })

    describe('when trying to connect an event dispatcher to something else', () => {
      it('throws an error', () => {
        const phaseId = 'phase_0'
        const dispatcherId = 'phase_1'
        const wf = WorkflowGenerator.generate({
          elements: {
            eventDispatchers: [
              EndEventDispatcher.create({ id: dispatcherId }),
            ],
            eventListeners: [],
            gateways: [],
            phases: [
              Phase.create({ id: phaseId }),
            ],
          },
        })
        expect(() => Workflow.connect(wf, dispatcherId, phaseId))
          .toThrow(/a\(n\) EVENT_DISPATCHER cannot connect to a PHASE/)
      })
    })

    describe('when connecting gateways', () => {
      describe('when connecting the loopback flow of a LoopGateway', () => {
        describe('when the passed elementId does not belong to a gateway', () => {
          it('throws an error', () => {
            const listenerId = 'eventListener_0'
            const dispatcherId = 'eventDispatcher_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [
                  EndEventDispatcher.create({ id: dispatcherId }),
                ],
                eventListeners: [
                  ApprovalEventListener.create({ id: listenerId }),
                ],
                flows: [],
                gateways: [],
                phases: [],
              },
            })

            expect(() => Workflow.connectGatewayLoopback(wf, listenerId, dispatcherId))
              .toThrow(/is not a gateway/)
          })
        })

        describe('when the passed elementId does belong to gateway, but not a loop gateway', () => {
          it('throws an error', () => {
            const gatewayId = 'gateway_0'
            const dispatcherId = 'eventDispatcher_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [
                  EndEventDispatcher.create({ id: dispatcherId }),
                ],
                eventListeners: [],
                flows: [],
                gateways: [
                  AndMergeGateway.create({ id: gatewayId }),
                ],
                phases: [],
              },
            })

            expect(() => Workflow.connectGatewayLoopback(wf, gatewayId, dispatcherId))
              .toThrow(/does not provide a loopback flow/)
          })
        })

        describe('when the passed elementId does belong to loopback gateway', () => {
          it('creates the required flow and updates the loopbackFlowId of the gateway', () => {
            const gatewayId = 'gateway_0'
            const phaseId = 'phase_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [],
                eventListeners: [],
                flows: [],
                gateways: [
                  LoopGateway.create({ id: gatewayId }),
                ],
                phases: [
                  Phase.create({ id: phaseId }),
                ],
              },
            })

            const res = Workflow.connectGatewayLoopback(wf, gatewayId, phaseId)

            expect(res.elements.flows[0]).toStrictEqual(expect.objectContaining({
              srcId: gatewayId,
              destId: phaseId,
            }))
            expect(res.elements.gateways[0].loopbackFlowId).toBe(res.elements.flows[0].id)
          })
        })

        describe('when trying to connect a second outgoing flow to an AndMergeGateway', () => {
          it('throws an error', () => {
            const gatewayId = 'gateway_0'
            const phaseId = 'phase_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [],
                eventListeners: [],
                gateways: [
                  AndMergeGateway.create({ id: gatewayId }),
                ],
                phases: [
                  Phase.create({ id: phaseId }),
                ],
                flows: [{ srcId: gatewayId, destId: phaseId, id: 'flow_1' }],
              },
            })

            expect(() => Workflow.connect(wf, gatewayId, phaseId))
              .toThrow(/Only one outgoing flow/)
          })
        })

        describe('when trying to connect a second outgoing flow to an OrMergeGateway', () => {
          it('throws an error', () => {
            const gatewayId = 'gateway_0'
            const phaseId = 'phase_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [],
                eventListeners: [],
                gateways: [
                  OrMergeGateway.create({ id: gatewayId }),
                ],
                phases: [
                  Phase.create({ id: phaseId }),
                ],
                flows: [{ srcId: gatewayId, destId: phaseId, id: 'flow_1' }],
              },
            })

            expect(() => Workflow.connect(wf, gatewayId, phaseId))
              .toThrow(/Only one outgoing flow/)
          })
        })

        describe('when trying to connect a second incoming flow to an AndSplitGateway', () => {
          it('throws an error', () => {
            const gatewayId = 'gateway_0'
            const eventListenerId = 'phase_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [],
                eventListeners: [
                  ApprovalEventListener.create({ id: eventListenerId }),
                ],
                gateways: [
                  AndSplitGateway.create({ id: gatewayId }),
                ],
                phases: [],
                flows: [{
                  srcId: eventListenerId,
                  destId: gatewayId,
                  id: 'flow_1',
                }],
              },
            })

            expect(() => Workflow.connect(wf, eventListenerId, gatewayId))
              .toThrow(/Only one incoming flow/)
          })
        })

        describe('when trying to connect a second incoming flow to an LoopGateway', () => {
          it('throws an error', () => {
            const gatewayId = 'gateway_0'
            const eventListenerId = 'phase_0'
            const wf = WorkflowGenerator.generate({
              elements: {
                eventDispatchers: [],
                eventListeners: [
                  ApprovalEventListener.create({ id: eventListenerId }),
                ],
                gateways: [
                  LoopGateway.create({ id: gatewayId }),
                ],
                phases: [],
                flows: [{
                  srcId: eventListenerId,
                  destId: gatewayId,
                  id: 'flow_1',
                }],
              },
            })

            expect(() => Workflow.connect(wf, eventListenerId, gatewayId))
              .toThrow(/Only one incoming flow/)
          })
        })
      })
    })
  })

  describe('disconnect', () => {

    it('removes the flow from the workflow', () => {
      const gatewayId = 'gateway_0'
      const eventListenerId = 'phase_0'
      const flowId = 'flow_0'
      const wf = WorkflowGenerator.generate({
        elements: {
          eventDispatchers: [],
          eventListeners: [
            ApprovalEventListener.create({ id: eventListenerId }),
          ],
          gateways: [
            AndMergeGateway.create({ id: gatewayId }),
          ],
          phases: [],
          flows: [{
            srcId: eventListenerId,
            destId: gatewayId,
            id: flowId,
          }],
        },
      })

      const res = Workflow.disconnect(wf, flowId)

      expect(res.elements.flows).toHaveLength(0)
    })

    describe('when disconnecting a flow from a LoopGateway', () => {
      describe('when it is the loopback flow', () => {
        it('removes the flow from the workflow and sets the loopbackFlowId to null', () => {
          const gatewayId = 'gateway_0'
          const phaseId = 'phase_0'
          const flowId = 'flow_0'
          const wf = WorkflowGenerator.generate({
            elements: {
              eventDispatchers: [],
              eventListeners: [],
              gateways: [
                LoopGateway.create({ id: gatewayId, loopbackFlowId: flowId }),
              ],
              phases: [
                Phase.create({ id: phaseId }),
              ],
              flows: [{
                srcId: gatewayId,
                destId: phaseId,
                id: flowId,
              }],
            },
          })

          const res = Workflow.disconnect(wf, flowId)

          expect(res.elements.flows).toHaveLength(0)
          expect(res.elements.gateways[0].loopbackFlowId).toBeNull()
        })
      })
    })
  })
})
