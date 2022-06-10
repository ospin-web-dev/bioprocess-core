const AndMergeGateway = require('../../../../src/workflow/elements/gateways/AndMergeGateway')
const AndSplitGateway = require('../../../../src/workflow/elements/gateways/AndSplitGateway')
const LoopGateway = require('../../../../src/workflow/elements/gateways/LoopGateway')
const OrMergeGateway = require('../../../../src/workflow/elements/gateways/OrMergeGateway')

const Gateways = require('../../../../src/workflow/elements/gateways/Gateways')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('EventListeners', () => {
  const addGatewaySetups = [
    { api: AndMergeGateway, method: 'addAndMergeGateway' },
    { api: AndSplitGateway, method: 'addAndSplitGateway' },
    { api: LoopGateway, method: 'addLoopGateway' },
    { api: OrMergeGateway, method: 'addOrMergeGateway' },
  ]

  /* eslint-disable-next-line jest/require-hook */
  addGatewaySetups.forEach(({ api, method }) => {
    describe(`${method}`, () => {
      describe('when the data is valid', () => {
        it(`adds a new ${api.name} to the workflow`, () => {
          const workflow = WorkflowGenerator.generate()

          const { elements: { gateways } } = Gateways[method](workflow)

          expect(gateways).toHaveLength(1)
          expect(gateways[0].type).toBe(api.TYPE)
          expect(gateways[0].id).toBe('gateway_0')
        })
      })

      describe('when the data is invalid', () => {
        it('throws an error', () => {
          const workflow = WorkflowGenerator.generate()

          expect(() => Gateways[method](workflow, { acceptMe: 'senpai' }))
            .toThrow(/"acceptMe" is not allowed/)
        })
      })
    })
  })

  describe('remove', () => {
    it('removes a gateway from the workflow', () => {
      const id = 'gateway_0'
      const workflow = WorkflowGenerator.generate({
        elements: {
          gateways: [
            LoopGateway.create({ id }),
          ],
        },
      })

      const { elements: { gateways } } = Gateways.remove(workflow, id)

      expect(gateways).toHaveLength(0)
    })
  })

  describe('update', () => {
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

        const { elements: { gateways } } = Gateways.update(workflow, id, update)

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

        expect(() => Gateways.update(workflow, id, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })
})
