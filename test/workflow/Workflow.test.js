const uuid = require('uuid')
const Workflow = require('../../src/workflow')
const WorkflowGenerator = require('../../src/test-helpers/WorkflowGenerator')

describe('Workflow', () => {

  describe('validateSchema', () => {
    describe('when used with valid data', () => {
      it('does NOT throw an error', () => {
        const workflow = WorkflowGenerator.generateTestWorkflow1()

        expect(() => Workflow.validateSchema(workflow)).not.toThrow()
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

      expect(res.version).toBe('1.0')
      expect(res.id).toStrictEqual(expect.any(String))
    })

    it('creates a workflow with a START event listener', () => {
      const res = Workflow.createTemplate()

      expect(res.elements[0].type).toBe(Workflow.EventListener.TYPES.START)
    })

    it('creates a workflow with an initial phase', () => {
      const res = Workflow.createTemplate()

      const phases = Workflow.getPhases(res)

      expect(phases).toHaveLength(1)
    })

    it('creates a connection from the start event and the initial phase', () => {
      const res = Workflow.createTemplate()

      const flows = Workflow.getFlows(res)
      const els = Workflow.getEventListeners(res)
      const phases = Workflow.getPhases(res)

      expect(flows[0].srcId).toBe(els[0].id)
      expect(flows[0].destId).toBe(phases[0].id)
    })

    it('creates a workflow with an approval event for the first phase', () => {
      const res = Workflow.createTemplate()

      const els = Workflow.getEventListeners(res)
      const phases = Workflow.getPhases(res)

      expect(els[1].type).toBe(Workflow.EventListener.TYPES.APPROVAL)
      expect(els[1].phaseId).toBe(phases[0].id)
    })

    it('creates a workflow with an END event dispatcher', () => {
      const res = Workflow.createTemplate()

      const eds = Workflow.getEventDispatchers(res)

      expect(eds).toHaveLength(1)
      expect(eds[0].type).toBe(Workflow.EventDispatcher.TYPES.END)
    })

    it('creates a connection from the approval event of the first phase and the END event dispatcher', () => {
      const res = Workflow.createTemplate()

      const flows = Workflow.getFlows(res)
      const els = Workflow.getEventListeners(res)
      const eds = Workflow.getEventDispatchers(res)

      expect(flows[1].srcId).toBe(els[1].id)
      expect(flows[1].destId).toBe(eds[0].id)
    })
  })

  describe('when getting elements', () => {
    describe('getPhases', () => {
      it('returns all phases', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getPhases(wf)

        expect(res).toHaveLength(1)
        expect(res.every(el => el.elementType === Workflow.Phase.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('getLastPhase', () => {
      it('returns the last phase', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const wfWithMorePhases = Workflow.addPhase(wf)

        const res = Workflow.getLastPhase(wfWithMorePhases)

        expect(res).toStrictEqual(Workflow.getPhases(wfWithMorePhases)[1])
      })
    })

    describe('getSetTargetsCommand', () => {
      it('returns the set target command of a phase', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const phaseId = Workflow.getPhases(wf)[0].id
        const wfWithCommand = Workflow.addSetTargetCommand(wf, phaseId)

        const res = Workflow.getSetTargetsCommand(wfWithCommand, phaseId)

        expect(res.type).toBe(Workflow.Command.TYPES.SET_TARGETS)
      })
    })

    describe('getFlows', () => {
      it('returns all flows', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getFlows(wf)

        expect(res).toHaveLength(2)
        expect(res.every(el => el.elementType === Workflow.Flow.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('getLastFlow', () => {
      it('returns the last flow', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getLastFlow(wf)

        expect(res).toStrictEqual(Workflow.getFlows(wf)[1])
      })
    })

    describe('getIncomingFlows', () => {
      it('returns all incoming flows of an element', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const elId = Workflow.getPhases(wf)[0].id
        const res = Workflow.getIncomingFlows(wf, elId)

        expect(res).toHaveLength(1)
        expect(res.every(el => el.destId === elId)).toBe(true)
      })
    })

    describe('getOutgoingFlows', () => {
      it('returns all outgoing flows of an element', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const elId = Workflow.getStartEventListeners(wf)[0].id
        const res = Workflow.getOutgoingFlows(wf, elId)

        expect(res).toHaveLength(1)
        expect(res.every(el => el.srcId === elId)).toBe(true)
      })
    })

    describe('getGateways', () => {
      it('returns all gateways', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getGateways(wf)

        expect(res).toHaveLength(3)
        expect(res.every(el => el.elementType === Workflow.Gateway.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('getEventDispatchers', () => {
      it('returns all gateways', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getEventDispatchers(wf)

        expect(res).toHaveLength(2)
        expect(res.every(el => el.elementType === Workflow.EventDispatcher.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('getEventListeners', () => {
      it('returns all eventListeners', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getEventListeners(wf)

        expect(res).toHaveLength(4)
        expect(res.every(el => el.elementType === Workflow.EventListener.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('getPhaseEventListeners', () => {
      it('returns all eventListeners of a phase', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const phases = Workflow.getPhases(wf)
        const res = Workflow.getPhaseEventListeners(wf, phases[0].id)

        expect(res).toHaveLength(1)
        expect(res.every(el => el.elementType === Workflow.EventListener.ELEMENT_TYPE
          && el.phaseId === phases[0].id)).toBe(true)
      })
    })

    describe('getGlobalEventListeners', () => {
      it('returns all global eventListeners', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getGlobalEventListeners(wf)

        expect(res).toHaveLength(3)
        expect(res.every(el => el.elementType === Workflow.EventListener.ELEMENT_TYPE
          && el.phaseId === null)).toBe(true)
      })
    })

    describe('getStartEventListeners', () => {
      it('returns all start eventListeners', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        const res = Workflow.getStartEventListeners(wf)

        expect(res).toHaveLength(1)
        expect(res.every(el => el.elementType === Workflow.EventListener.ELEMENT_TYPE
          && el.type === Workflow.EventListener.TYPES.START)).toBe(true)
      })
    })
  })

  describe('when adding elements', () => {
    describe('addPhase', () => {
      it('adds a phase', () => {
        const wf = WorkflowGenerator.generate()

        const res = Workflow.addPhase(wf)

        const phases = Workflow.getPhases(res)
        expect(phases).toHaveLength(1)
        expect(phases.every(el => el.elementType === Workflow.Phase.ELEMENT_TYPE)).toBe(true)
      })
    })

    describe('addSetTargetCommand', () => {
      it('adds an empty set target command to a phase', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const phaseId = Workflow.getPhases(wf)[0].id

        const res = Workflow.addSetTargetCommand(wf, phaseId)

        const phase = Workflow.getPhases(res)[0]
        expect(phase.commands).toHaveLength(1)
      })
    })

    describe('addFlow', () => {
      it('adds a flow', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const gatewayId = Workflow.getGateways(wf)[0].id
        const elId = Workflow.getEventListeners(wf)[0].id

        const res = Workflow.addFlow(wf, { destId: gatewayId, srcId: elId })

        const flows = Workflow.getFlows(res)
        expect(flows).toHaveLength(3)
      })

      describe('when trying to connect an element to itself', () => {
        it('throws an error', () => {
          const wf = WorkflowGenerator.generateTestWorkflow1()
          const elId = Workflow.getGateways(wf)[0].id

          expect(() => Workflow.addFlow(wf, { destId: elId, srcId: elId })).toThrow(/connect an element to itself/)
        })
      })

      describe('when trying to connect an eventListener to a second element', () => {
        it('throws an error', () => {
          const wf = WorkflowGenerator.generateTestWorkflow1()
          const srcId = Workflow.getStartEventListeners(wf)[0].id
          const destId = Workflow.getGateways(wf)[0].id

          expect(() => Workflow.addFlow(wf, { destId, srcId })).toThrow(/Only one outgoing flow/)
        })
      })

      describe('when connecting a gateway', () => {
        const createSetupWithGateway = () => (
          Workflow.addOrGateway(WorkflowGenerator.generate())
        )

        describe('to an eventListener', () => {
          it('throws', () => {
            const wf = createSetupWithGateway()
            const updatedWf = Workflow.addTimerEventListener(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getGateways(updatedWf)[0].id,
              destId: Workflow.getEventListeners(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

        describe('to another eventDispatcher', () => {
          it('throws', () => {
            const wf = createSetupWithGateway()
            const updatedWf = Workflow.addEndEventDispatcher(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getGateways(updatedWf)[0].id,
              destId: Workflow.getEventDispatchers(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

        describe('to phase', () => {
          it('throws', () => {
            const wf = createSetupWithGateway()
            const updatedWf = Workflow.addPhase(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getGateways(updatedWf)[0].id,
              destId: Workflow.getPhases(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

        describe('to another gateway', () => {
          it('throws', () => {
            const wf = createSetupWithGateway()
            const updatedWf = Workflow.addOrGateway(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getGateways(updatedWf)[0].id,
              destId: Workflow.getGateways(updatedWf)[1].id,
            })).not.toThrow()
          })
        })

      })

      describe('when connecting a phase', () => {
        const createSetupWithPhase = () => (
          Workflow.addPhase(WorkflowGenerator.generate())
        )

        describe('to an eventListener', () => {
          it('throws', () => {
            const wf = createSetupWithPhase()
            const updatedWf = Workflow.addTimerEventListener(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getPhases(updatedWf)[0].id,
              destId: Workflow.getEventListeners(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to another eventDispatcher', () => {
          it('throws', () => {
            const wf = createSetupWithPhase()
            const updatedWf = Workflow.addEndEventDispatcher(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getPhases(updatedWf)[0].id,
              destId: Workflow.getEventDispatchers(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to another phase', () => {
          it('throws', () => {
            const wf = createSetupWithPhase()
            const updatedWf = Workflow.addPhase(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getPhases(updatedWf)[0].id,
              destId: Workflow.getPhases(updatedWf)[1].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to a gateway', () => {
          it('throws', () => {
            const wf = createSetupWithPhase()
            const updatedWf = Workflow.addOrGateway(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getPhases(updatedWf)[0].id,
              destId: Workflow.getGateways(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })
      })

      describe('when connecting an event dispatcher', () => {
        const createSetupWithEventDispatcher = () => (
          Workflow.addEndEventDispatcher(WorkflowGenerator.generate())
        )

        describe('to an eventListener', () => {
          it('throws', () => {
            const wf = createSetupWithEventDispatcher()
            const updatedWf = Workflow.addTimerEventListener(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventDispatchers(updatedWf)[0].id,
              destId: Workflow.getEventListeners(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to another eventDispatcher', () => {
          it('throws', () => {
            const wf = createSetupWithEventDispatcher()
            const updatedWf = Workflow.addEndEventDispatcher(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventDispatchers(updatedWf)[0].id,
              destId: Workflow.getEventDispatchers(updatedWf)[1].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to a phase', () => {
          it('throws', () => {
            const wf = createSetupWithEventDispatcher()
            const updatedWf = Workflow.addPhase(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventDispatchers(updatedWf)[0].id,
              destId: Workflow.getPhases(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to a gateway', () => {
          it('throws', () => {
            const wf = createSetupWithEventDispatcher()
            const updatedWf = Workflow.addOrGateway(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventDispatchers(updatedWf)[0].id,
              destId: Workflow.getGateways(updatedWf)[0].id,
            })).toThrow(/cannot connect to a/)
          })
        })

      })

      describe('when connecting an eventListener', () => {
        const createSetupWithEventListener = () => (
          Workflow.addStartEventListener(WorkflowGenerator.generate())
        )

        describe('to another eventListener', () => {
          it('throws', () => {
            const wf = createSetupWithEventListener()
            const updatedWf = Workflow.addTimerEventListener(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventListeners(updatedWf)[0].id,
              destId: Workflow.getEventListeners(updatedWf)[1].id,
            })).toThrow(/cannot connect to a/)
          })
        })

        describe('to an eventDispatcher', () => {
          it('does not throw', () => {
            const wf = createSetupWithEventListener()
            const updatedWf = Workflow.addEndEventDispatcher(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventListeners(updatedWf)[0].id,
              destId: Workflow.getEventDispatchers(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

        describe('to a phase', () => {
          it('does not throw', () => {
            const wf = createSetupWithEventListener()
            const updatedWf = Workflow.addPhase(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventListeners(updatedWf)[0].id,
              destId: Workflow.getPhases(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

        describe('to a gateway', () => {
          it('does not throw', () => {
            const wf = createSetupWithEventListener()
            const updatedWf = Workflow.addOrGateway(wf)

            expect(() => Workflow.addFlow(updatedWf, {
              srcId: Workflow.getEventListeners(updatedWf)[0].id,
              destId: Workflow.getGateways(updatedWf)[0].id,
            })).not.toThrow()
          })
        })

      })
    })

    describe('addTrueFlow', () => {
      it('adds a true flow to a conditional gateway', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const conditionalGatewayId = Workflow.getElementBy(wf, {
          elementType: Workflow.Gateway.ELEMENT_TYPE,
          type: Workflow.Gateway.TYPES.CONDITIONAL,
        }).id
        const targetElId = Workflow.getEventDispatchers(wf)[1].id

        const res = Workflow.addTrueFlow(wf, { srcId: conditionalGatewayId, destId: targetElId })

        const flows = Workflow.getFlows(res)
        expect(flows).toHaveLength(3)

        const updatedGateway = Workflow.getElementById(res, conditionalGatewayId)
        expect(updatedGateway.trueFlowId).toBe(flows[2].id)
      })

      it('throws an error when the element is not a gateway', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const listenerId = Workflow.getElementBy(wf, {
          elementType: Workflow.EventListener.ELEMENT_TYPE,
          type: Workflow.EventListener.TYPES.CONDITION,
        }).id
        const targetElId = Workflow.getEventDispatchers(wf)[1].id

        expect(() => Workflow.addTrueFlow(wf, { srcId: listenerId, destId: targetElId }))
          .toThrow(/not a gateway/)
      })

      it('throws an error when the element is a gateway but not a CONDITIONAL one', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const conditionalGatewayId = Workflow.getElementBy(wf, {
          elementType: Workflow.Gateway.ELEMENT_TYPE,
          type: Workflow.Gateway.TYPES.OR,
        }).id
        const targetElId = Workflow.getEventDispatchers(wf)[1].id

        expect(() => Workflow.addTrueFlow(wf, { srcId: conditionalGatewayId, destId: targetElId }))
          .toThrow(/gateway of type/)
      })
    })

    describe('addFalseFlow', () => {
      it('adds a true flow to a conditional gateway', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const conditionalGatewayId = Workflow.getElementBy(wf, {
          elementType: Workflow.Gateway.ELEMENT_TYPE,
          type: Workflow.Gateway.TYPES.CONDITIONAL,
        }).id
        const targetElId = Workflow.getEventDispatchers(wf)[1].id

        const res = Workflow.addFalseFlow(wf, { srcId: conditionalGatewayId, destId: targetElId })

        const flows = Workflow.getFlows(res)
        expect(flows).toHaveLength(3)

        const updatedGateway = Workflow.getElementById(res, conditionalGatewayId)
        expect(updatedGateway.falseFlowId).toBe(flows[2].id)
      })
    })

    describe.each([
      { type: Workflow.EventListener.TYPES.START, fn: Workflow.addStartEventListener },
      { type: Workflow.EventListener.TYPES.TIMER, fn: Workflow.addTimerEventListener },
      { type: Workflow.EventListener.TYPES.CONDITION, fn: Workflow.addConditionEventListener },
      { type: Workflow.EventListener.TYPES.APPROVAL, fn: Workflow.addApprovalEventListener },
    ])('when adding a $type event listeners', ({ type, fn }) => {
      it('adds the event listener', () => {
        const wf = WorkflowGenerator.generate()

        const res = fn(wf)

        const eventListeners = Workflow.getEventListeners(res)
        expect(eventListeners).toHaveLength(1)
        expect(eventListeners.every(el => el.type === type)).toBe(true)
      })
    })

    describe('when adding a second start event listener', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()

        expect(() => Workflow.addStartEventListener(wf)).toThrow(/exactly one START event listener/)
      })
    })

    describe.each([
      { type: Workflow.Gateway.TYPES.OR, fn: Workflow.addOrGateway },
      { type: Workflow.Gateway.TYPES.AND, fn: Workflow.addAndGateway },
      { type: Workflow.Gateway.TYPES.CONDITIONAL, fn: Workflow.addConditionalGateway },
    ])('when adding a $type gateway', ({ type, fn }) => {
      it('adds the gateway', () => {
        const wf = WorkflowGenerator.generate()

        const res = fn(wf)

        const gws = Workflow.getGateways(res)
        expect(gws).toHaveLength(1)
        expect(gws.every(el => el.type === type)).toBe(true)
      })
    })

    describe.each([
      { type: Workflow.EventDispatcher.TYPES.END, fn: Workflow.addEndEventDispatcher },
      { type: Workflow.EventDispatcher.TYPES.ALERT, fn: Workflow.addAlertEventDispatcher },
    ])('when adding a $type event dispatcher', ({ type, fn }) => {
      it('adds the gateway', () => {
        const wf = WorkflowGenerator.generate()

        const res = fn(wf)

        const eds = Workflow.getEventDispatchers(res)
        expect(eds).toHaveLength(1)
        expect(eds.every(el => el.type === type)).toBe(true)
      })
    })
  })

  describe('when removing elements', () => {
    describe('removeFlow', () => {
      it('removes the flow', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const flowId = Workflow.getFlows(wf)[0].id

        const res = Workflow.removeFlow(wf, flowId)

        const deletedFlow = Workflow.getElementById(res, flowId)
        expect(deletedFlow).toBeUndefined()
      })

      describe('when the flow is the true flow of a conditional gateway', () => {
        it('unsets the trueFlowId of that gateway', () => {
          const wf = WorkflowGenerator.generateTestWorkflow1()
          const conditionalGatewayId = Workflow.getElementBy(wf, {
            elementType: Workflow.Gateway.ELEMENT_TYPE,
            type: Workflow.Gateway.TYPES.CONDITIONAL,
          }).id
          const targetElId = Workflow.getEventDispatchers(wf)[1].id
          const wfWithTrueFlow = Workflow
            .addTrueFlow(wf, { srcId: conditionalGatewayId, destId: targetElId })

          const updatedGateway = Workflow.getElementById(wfWithTrueFlow, conditionalGatewayId)
          expect(updatedGateway.trueFlowId).not.toBeNull()

          const flowId = Workflow.getLastFlow(wfWithTrueFlow).id
          const res = Workflow.removeFlow(wfWithTrueFlow, flowId)

          const deletedFlow = Workflow.getElementById(res, flowId)
          expect(deletedFlow).toBeUndefined()

          const updatedGateway2 = Workflow.getElementById(res, conditionalGatewayId)
          expect(updatedGateway2.trueFlowId).toBeNull()
        })
      })

      describe('when the flow is the false flow of a conditional gateway', () => {
        it('unsets the falseFlowId of that gateway', () => {
          const wf = WorkflowGenerator.generateTestWorkflow1()
          const conditionalGatewayId = Workflow.getElementBy(wf, {
            elementType: Workflow.Gateway.ELEMENT_TYPE,
            type: Workflow.Gateway.TYPES.CONDITIONAL,
          }).id
          const targetElId = Workflow.getEventDispatchers(wf)[1].id
          const wfWithFalseFlow = Workflow
            .addFalseFlow(wf, { srcId: conditionalGatewayId, destId: targetElId })

          const updatedGateway = Workflow.getElementById(wfWithFalseFlow, conditionalGatewayId)
          expect(updatedGateway.falseFlowId).not.toBeNull()

          const flowId = Workflow.getLastFlow(wfWithFalseFlow).id
          const res = Workflow.removeFlow(wfWithFalseFlow, flowId)

          const deletedFlow = Workflow.getElementById(res, flowId)
          expect(deletedFlow).toBeUndefined()

          const updatedGateway2 = Workflow.getElementById(res, conditionalGatewayId)
          expect(updatedGateway2.falseFlowId).toBeNull()
        })
      })
    })

    describe('removeElement', () => {
      it('deletes an element including all connected flows', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const timerEventListener = Workflow.getElementBy(wf, {
          elementType: Workflow.EventListener.ELEMENT_TYPE,
          type: Workflow.EventListener.TYPES.TIMER,
        })

        const flowsBefore = Workflow.getFlows(wf)
        const res = Workflow.removeElement(wf, timerEventListener.id)

        const deletedEl = Workflow.getElementById(res, timerEventListener.id)
        expect(deletedEl).toBeUndefined()

        const flowsAfter = Workflow.getFlows(res)
        expect(flowsAfter.length).toBeLessThan(flowsBefore.length)
      })
    })

    describe('when trying to delete a flow', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const flowId = Workflow.getFlows(wf)[0].id

        expect(() => Workflow.removeElement(wf, flowId)).toThrow(/via the 'removeFlow'/)
      })
    })

    describe('when trying to delete the last phase', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const phaseId = Workflow.getPhases(wf)[0].id

        expect(() => Workflow.removeElement(wf, phaseId)).toThrow(/at least one phase/)
      })
    })

    describe('when trying to delete the last END event dispatcher', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const elId = Workflow.getEventDispatchers(wf)[0].id

        expect(() => Workflow.removeElement(wf, elId)).toThrow(/at least one END event dispatcher/)
      })
    })

    describe('when trying to delete the last START event listener', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const elId = Workflow.getStartEventListeners(wf)[0].id

        expect(() => Workflow.removeElement(wf, elId)).toThrow(/exactly one START event listener/)
      })
    })
  })

  describe('removeSetTargetsCommand', () => {
    it('removes a set targets command from a phase', () => {
      const wf = WorkflowGenerator.generateTestWorkflow1()
      const phaseId = Workflow.getPhases(wf)[0].id
      const wfWithCommand = Workflow.addSetTargetCommand(wf, phaseId)

      const res = Workflow.removeSetTargetsCommand(wfWithCommand, phaseId)

      const phase = Workflow.getPhases(res)[0]
      expect(phase.commands).toHaveLength(1)
    })
  })

  describe('when working when an existing set target command', () => {

    describe('setting, getting and removing the target works', () => {
      it('returns the set target value of a phase', () => {
        const wf = WorkflowGenerator.generateTestWorkflow1()
        const phaseId = Workflow.getPhases(wf)[0].id
        const wfWithCommand = Workflow.addSetTargetCommand(wf, phaseId)
        const inputNodeId = uuid.v4(9)
        const wfWithTargetValue = Workflow
          .setTargetValue(wfWithCommand, phaseId, inputNodeId, 37)

        const res = Workflow.getTargetValue(wfWithTargetValue, phaseId, inputNodeId)

        expect(res).toBe(37)

        const res2 = Workflow.removeTargetValue(wfWithTargetValue, phaseId, inputNodeId)

        const updatedCommand = Workflow.getSetTargetsCommand(res2, phaseId)
        expect(updatedCommand.data.targets).toHaveLength(0)
      })
    })
  })


})
