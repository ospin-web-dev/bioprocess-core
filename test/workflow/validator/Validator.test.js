const Validator = require('../../../src/workflow/validator/Validator')
const Workflow = require('../../../src/workflow/Workflow')
const EventListeners = require('../../../src/workflow/elements/eventListeners/EventListeners')
const Phases = require('../../../src/workflow/elements/phases/Phases')
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
    })

    describe('when the workflow is valid in format and semantics', () => {
      it('throws an error', () => {
        const wf = WorkflowGenerator.generate()
        const workflowWithOneStartEvent = EventListeners
          .addStartEventListener(wf, { interrupting: true })
        const workflowWithPhase = Phases.addPhase(workflowWithOneStartEvent)

        expect(() => Validator.validate(workflowWithPhase)).not.toThrow()
      })
    })
  })

})
