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
              OrMergeGateway.create({ id: 'gateway_4' }),
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

  describe('createTemplate', () => {
    it('creats a workflow and assigns id and version', () => {
      const res = Workflow.createTemplate()

      expect(res.version).toBe(Workflow.DEFAULT_VERSION)
      expect(res.id).toStrictEqual(expect.any(String))
    })

    it('creats a workflow with a START event', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.eventListeners).toHaveLength(1)
      expect(res.elements.eventListeners[0].type).toBe(StartEventListener.TYPE)
    })

    it('creats a workflow with an initial phase event', () => {
      const res = Workflow.createTemplate()

      expect(res.elements.phases).toHaveLength(1)
    })
  })
})
