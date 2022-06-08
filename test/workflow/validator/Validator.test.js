const Validator = require('../../../src/workflow/validator/Validator')
const EventListeners = require('../../../src/workflow/elements/eventListeners/EventListeners')
const EventDispatchers = require('../../../src/workflow/elements/eventDispatchers/EventDispatchers')
const Phases = require('../../../src/workflow/elements/phases/Phases')
const Flows = require('../../../src/workflow/elements/flows/Flows')
const StartEventListener = require('../../../src/workflow/elements/eventListeners/StartEventListener')
const WorkflowGenerator = require('../../helpers/generators/WorkflowGenerator')

describe('Validator', () => {
  describe('validate', () => {
    describe('when the workflow has an invalid data schema', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generate()
        delete wf.id

        expect(() => Validator.validate(wf)).toThrow(/"id" is required/)
      })
    })

    describe('when the workflow is breaking a semantic rule', () => {
      describe('for the containsExactlyOneStartEventEventListener rule', () => {
        describe('when the workflow does NOT contain any START event', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()

            expect(() => Validator.validate(wf)).toThrow(/exactly one START event listener/)
          })
        })

        describe('when the workflow does contains multiple START events', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithPhase = Phases.addPhase(wf)
            const updatedWorkflow = EventListeners
              .addStartEventListener(workflowWithPhase)

            /* because the API forbids adding a second one, we bypass it */
            const secondListener = StartEventListener
              .create({ id: EventListeners.generateUniqueId(updatedWorkflow) })
            updatedWorkflow.elements.eventListeners.push(secondListener)

            expect(() => Validator.validate(updatedWorkflow))
              .toThrow(/exactly one START event listener/)
          })
        })
      })

      describe('for the containsAtLeastOnePhase rule', () => {
        describe('when the workflow does NOT contain any phases', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = EventListeners
              .addStartEventListener(wf)

            expect(() => Validator.validate(workflowWithOneStartEvent)).toThrow(/at least one phase/)
          })
        })
      })

      describe('for the everyPhaseIsReachable rule', () => {
        describe('when the workflow does contain unreachable phases', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = EventListeners
              .addStartEventListener(wf)
            const workflowWithPhase = Phases.addPhase(workflowWithOneStartEvent)

            expect(() => Validator.validate(workflowWithPhase)).toThrow(/contains unreachable phase/)
          })
        })
      })

      describe('for the containsAtLeastOneEndEventDispatcher rule', () => {
        describe('when the workflow does NOT contain any end event dispatchers', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = EventListeners
              .addStartEventListener(wf)
            const workflowWithPhase = Phases.addPhase(workflowWithOneStartEvent)
            const withPhaseConnected = Flows.addFlow(workflowWithPhase, {
              srcId: workflowWithPhase.elements.eventListeners[0].id,
              destId: workflowWithPhase.elements.phases[0].id,
            })

            expect(() => Validator.validate(withPhaseConnected)).toThrow(/at least one END event dispatcher/)
          })
        })
      })

      describe('for the everyEndEventDispatcherIsReachable rule', () => {
        describe('when the workflow does contain unrachable end event dispatchers', () => {
          it('throws an error', () => {
            const wf = WorkflowGenerator.generate()
            const workflowWithOneStartEvent = EventListeners
              .addStartEventListener(wf)
            const workflowWithPhase = Phases.addPhase(workflowWithOneStartEvent)
            const withPhaseConnected = Flows.addFlow(workflowWithPhase, {
              srcId: workflowWithPhase.elements.eventListeners[0].id,
              destId: workflowWithPhase.elements.phases[0].id,
            })
            const withEndEventDispatcher = EventDispatchers
              .addEndEventDispatcher(withPhaseConnected)

            expect(() => Validator.validate(withEndEventDispatcher)).toThrow(/contains unreachable END event dispatcher/)
          })
        })
      })

    })

    describe('when the workflow is valid in format and semantics', () => {
      it('does NOT throw an error', () => {
        const wf = WorkflowGenerator.generate()
        const workflowWithOneStartEvent = EventListeners
          .addStartEventListener(wf, { interrupting: true })
        const workflowWithPhase = Phases.addPhase(workflowWithOneStartEvent)
        const withPhaseConnected = Flows.addFlow(workflowWithPhase, {
          srcId: workflowWithPhase.elements.eventListeners[0].id,
          destId: workflowWithPhase.elements.phases[0].id,
        })
        const workFlowWithEndEventDispatcher = EventDispatchers
          .addEndEventDispatcher(withPhaseConnected)
        const workflowWithApprovalEvent = EventListeners
          .addApprovalEventListener(
            workFlowWithEndEventDispatcher,
            { phaseId: workFlowWithEndEventDispatcher.elements.phases[0].id },
          )

        const fullyConnected = Flows.addFlow(workflowWithApprovalEvent, {
          srcId: workflowWithApprovalEvent.elements.eventListeners[1].id,
          destId: workflowWithApprovalEvent.elements.eventDispatchers[0].id,
        })

        expect(() => Validator.validate(fullyConnected)).not.toThrow()
      })
    })
  })

})
