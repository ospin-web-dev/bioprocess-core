const {
  Flows,
  Phases,
  Gateways,
  ApprovalEventListener,
  EndEventDispatcher,
  LoopGateway,
  AndMergeGateway,
  OrMergeGateway,
  AndSplitGateway,
  pipe,
} = require('../../../../src/workflow/Workflow')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')

describe('Flows', () => {

  const createSetup = (wf = WorkflowGenerator.generate()) => {
    wf = Phases.add(wf)
    wf = ApprovalEventListener.add(wf)
    const listeners = ApprovalEventListener.getAll(wf)
    const lastListener = listeners[listeners.length - 1]
    return Flows.add(wf, {
      srcId: lastListener.id,
      destId: Phases.getLast(wf).id,
    })
  }

  /* eslint-disable */
  testCollectionDefaultGetters(Flows, createSetup)
  /* eslint-enable */

  describe('add', () => {

    describe('when trying to connect an element to itself', () => {
      it('throws an error', () => {
        let wf = WorkflowGenerator.generate()
        wf = EndEventDispatcher.add(wf)

        expect(() => Flows.add(wf, {
          srcId: EndEventDispatcher.getAll(wf)[0].id,
          destId: EndEventDispatcher.getAll(wf)[0].id,
        })).toThrow(/Cannot connect an element to itself/)
      })
    })

    describe('when trying to add a flow from an event dispatcher', () => {

      const createSetupWithEndEventDispather = () => {
        const wf = WorkflowGenerator.generate()
        return EndEventDispatcher.add(wf)
      }

      describe('to an event dispatcher', () => {
        it('throws an error', () => {
          let wf = createSetupWithEndEventDispather()
          wf = EndEventDispatcher.add(wf)

          expect(() => Flows.add(wf, {
            srcId: EndEventDispatcher.getAll(wf)[0].id,
            destId: EndEventDispatcher.getAll(wf)[1].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to an event listener', () => {
        it('throws an error', () => {
          let wf = createSetupWithEndEventDispather()
          wf = ApprovalEventListener.add(wf)

          expect(() => Flows.add(wf, {
            srcId: EndEventDispatcher.getAll(wf)[0].id,
            destId: ApprovalEventListener.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a gateway', () => {
        it('throws an error', () => {
          let wf = createSetupWithEndEventDispather()
          wf = LoopGateway.add(wf)

          expect(() => Flows.add(wf, {
            srcId: EndEventDispatcher.getAll(wf)[0].id,
            destId: LoopGateway.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a phase', () => {
        it('throws an error', () => {
          let wf = createSetupWithEndEventDispather()
          wf = Phases.add(wf)

          expect(() => Flows.add(wf, {
            srcId: EndEventDispatcher.getAll(wf)[0].id,
            destId: Phases.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })
    })

    describe('when trying to add a flow from an event listener', () => {

      const createSetupWithApprovalEventListener = () => {
        const wf = WorkflowGenerator.generate()
        return ApprovalEventListener.add(wf)
      }

      describe('to an event dispatcher', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = EndEventDispatcher.add(wf)

          expect(() => Flows.add(wf, {
            srcId: ApprovalEventListener.getAll(wf)[0].id,
            destId: EndEventDispatcher.getAll(wf)[0].id,
          })).not.toThrow()
        })
      })

      describe('to an event listener', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = ApprovalEventListener.add(wf)

          expect(() => Flows.add(wf, {
            srcId: ApprovalEventListener.getAll(wf)[0].id,
            destId: ApprovalEventListener.getAll(wf)[1].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a gateway', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = LoopGateway.add(wf)

          expect(() => Flows.add(wf, {
            srcId: ApprovalEventListener.getAll(wf)[0].id,
            destId: LoopGateway.getAll(wf)[0].id,
          })).not.toThrow()
        })
      })

      describe('to a phase', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = Phases.add(wf)

          expect(() => Flows.add(wf, {
            srcId: ApprovalEventListener.getAll(wf)[0].id,
            destId: Phases.getAll(wf)[0].id,
          })).not.toThrow()
        })
      })
    })

    describe('when trying to add a flow from a gateway', () => {

      const createSetupWithApprovalEventListener = () => {
        const wf = WorkflowGenerator.generate()
        return LoopGateway.add(wf)
      }

      describe('to an event dispatcher', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = EndEventDispatcher.add(wf)

          expect(() => Flows.add(wf, {
            srcId: LoopGateway.getAll(wf)[0].id,
            destId: EndEventDispatcher.getAll(wf)[0].id,
          })).not.toThrow()
        })
      })

      describe('to an event listener', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = ApprovalEventListener.add(wf)

          expect(() => Flows.add(wf, {
            srcId: LoopGateway.getAll(wf)[0].id,
            destId: ApprovalEventListener.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a gateway', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = LoopGateway.add(wf)

          expect(() => Flows.add(wf, {
            srcId: LoopGateway.getAll(wf)[0].id,
            destId: LoopGateway.getAll(wf)[1].id,
          })).not.toThrow()
        })
      })

      describe('to a phase', () => {
        it('does NOT throw an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = Phases.add(wf)

          expect(() => Flows.add(wf, {
            srcId: LoopGateway.getAll(wf)[0].id,
            destId: Phases.getAll(wf)[0].id,
          })).not.toThrow()
        })
      })
    })

    describe('when trying to add a flow from a phase', () => {

      const createSetupWithApprovalEventListener = () => {
        const wf = WorkflowGenerator.generate()
        return Phases.add(wf)
      }

      describe('to an event dispatcher', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = EndEventDispatcher.add(wf)

          expect(() => Flows.add(wf, {
            srcId: Phases.getAll(wf)[0].id,
            destId: EndEventDispatcher.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to an event listener', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = ApprovalEventListener.add(wf)

          expect(() => Flows.add(wf, {
            srcId: Phases.getAll(wf)[0].id,
            destId: ApprovalEventListener.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a gateway', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = LoopGateway.add(wf)

          expect(() => Flows.add(wf, {
            srcId: Phases.getAll(wf)[0].id,
            destId: LoopGateway.getAll(wf)[0].id,
          })).toThrow(/cannot connect/)
        })
      })

      describe('to a phase', () => {
        it('throws an error', () => {
          let wf = createSetupWithApprovalEventListener()
          wf = Phases.add(wf)

          expect(() => Flows.add(wf, {
            srcId: Phases.getAll(wf)[0].id,
            destId: Phases.getAll(wf)[1].id,
          })).toThrow(/cannot connect/)
        })
      })
    })

    describe.each([
      { elemInterface: AndMergeGateway, name: 'AndMergeGateway' },
      { elemInterface: OrMergeGateway, name: 'OrMergeGateway' },
    ])('when adding a second outgoing flow to an $name', ({ elemInterface }) => {
      it('throws an error', () => {
        let wf = WorkflowGenerator.generate()
        wf = Phases.add(wf)
        wf = Phases.add(wf)
        wf = elemInterface.add(wf)
        const phases = Phases.getAll(wf)
        const gateway = elemInterface.getAll(wf)[0]

        wf = Flows.add(wf, { srcId: gateway.id, destId: phases[0].id })
        expect(() => Flows.add(wf, { srcId: gateway.id, destId: phases[1].id }))
          .toThrow(/Only one outgoing flow/)
      })
    })

    describe.each([
      { elemInterface: LoopGateway, name: 'LoopGateway' },
      { elemInterface: AndSplitGateway, name: 'AndSplitGateway' },
      { elemInterface: Phases, name: 'Phase' },
    ])('when adding a second incoming flow to an $name', ({ elemInterface }) => {
      it('throws an error', () => {
        let wf = WorkflowGenerator.generate()
        wf = ApprovalEventListener.add(wf)
        wf = ApprovalEventListener.add(wf)
        wf = elemInterface.add(wf)
        const listeners = ApprovalEventListener.getAll(wf)
        const gateway = elemInterface.getAll(wf)[0]

        wf = Flows.add(wf, { srcId: listeners[0].id, destId: gateway.id })
        expect(() => Flows.add(wf, { srcId: listeners[1].id, destId: gateway.id }))
          .toThrow(/Only one incoming flow/)
      })
    })
  })

  describe('addLoopbackFlow', () => {
    describe('when the passed srcId does NOT belong to a Gateway', () => {
      it('throws an error', () => {
        const wf = pipe([
          WorkflowGenerator.generate,
          Phases.add,
          Phases.add,
        ])

        expect(() => Flows.addLoopbackFlow(wf, {
          srcId: Phases.getAll(wf)[0].id,
          destId: Phases.getAll(wf)[1].id,
        })).toThrow(/is not a gateway/)
      })
    })

    describe('when the passed srcId does NOT belong to a LoopGateway', () => {
      it('throws an error', () => {
        const wf = pipe([
          WorkflowGenerator.generate,
          Phases.add,
          AndMergeGateway.add,
        ])

        expect(() => Flows.addLoopbackFlow(wf, {
          srcId: Gateways.getAll(wf)[0].id,
          destId: Phases.getAll(wf)[0].id,
        })).toThrow(/does not provide a loopback flow/)
      })
    })
  })

  describe('remove', () => {
    it('removes a flow from the workflow', () => {
      const wf = createSetup()
      const flowId = Flows.getAll(wf)[0].id

      const { elements: { flows } } = Flows.remove(wf, flowId)

      expect(flows).toHaveLength(0)
    })

    describe('when the flow was connected to a LoopGateway', () => {
      it('removes the loopbackFlowId from the LoopGateway if the flow', () => {
        let wf = WorkflowGenerator.generate()
        wf = LoopGateway.add(wf)
        wf = Phases.add(wf)
        const gateways = Gateways.getAll(wf)
        const lastGateway = gateways[gateways.length - 1]
        wf = Flows.addLoopbackFlow(wf, { srcId: lastGateway.id, destId: Phases.getLast(wf).id })

        wf = Flows.remove(wf, Flows.getLast(wf).id)

        const gateway = Gateways.getAll(wf)[0]

        expect(gateway.loopbackFlowId).toBeNull()
      })
    })
  })
})
