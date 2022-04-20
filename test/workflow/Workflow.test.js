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

describe('Workflow', () => {
  describe('validate', () => {
    describe('when used with valid data', () => {
      it('does NOT throw an error', () => {
        const data = {
          id: '4d4c0431-a4a5-462e-891d-d082b27c7c28',
          version: '1.0',
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
        }

        expect(() => Workflow.validateSchema(data)).not.toThrow()
      })
    })

    describe('when used with invalid data', () => {
      it('does throw an error', () => {
        const data = {
          id: '4d4c0431-a4a5-462e-891d-d082b27c7c28',
          version: '1.0',
          nodes: [],
        }

        expect(() => Workflow.validateSchema(data)).toThrow(/"nodes" is not allowed/)
      })
    })
  })
})
