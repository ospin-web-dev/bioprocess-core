const Phase = require('../../../../src/workflow/elements/phases/Phase')
const Command = require('../../../../src/workflow/elements/phases/commands/Command')
const Phases = require('../../../../src/workflow/elements/phases/Phases')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('Phases', () => {
  describe('addPhase', () => {
    describe('when the data is valid', () => {
      it('adds a new phase to the workflow', () => {
        const workflow = WorkflowGenerator.generate()

        const { elements: { phases } } = Phases.addPhase(workflow)

        expect(phases).toHaveLength(1)
        expect(phases[0].id).toBe('phase_0')
      })
    })

    describe('when the data is invalid', () => {
      it('throws an error', () => {
        const workflow = WorkflowGenerator.generate()

        expect(() => Phases.addPhase(workflow, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

  describe('removePhase', () => {
    it('removes a phase from the workflow', () => {
      const id1 = 'phase_0'
      const id2 = 'phase_1'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id: id1 }),
            Phase.create({ id: id2 }),
          ],
        },
      })

      const { elements: { phases } } = Phases.removePhase(workflow, id1)

      expect(phases).toHaveLength(1)
    })

    describe('when trying to remove the last phase', () => {
      it('throws an error', () => {
        const id = 'phase_0'
        const workflow = WorkflowGenerator.generate({
          elements: {
            phases: [
              Phase.create({ id }),
            ],
          },
        })

        expect(() => Phases.removePhase(workflow, id))
          .toThrow(/Cannot remove last phase/)
      })
    })
  })

  describe('updatePhase', () => {
    describe('when the data is valid', () => {
      it('updates a phase on the workflow', () => {
        const id = 'phase_0'
        const update = {
          commands: [
            {
              type: Command.TYPES.SET_TARGETS,
              data: [
                { fctId: '1', slotName: 'value', target: 1 },
              ],
            },
          ],
        }
        const workflow = WorkflowGenerator.generate({
          elements: {
            phases: [
              Phase.create({ id }),
            ],
          },
        })

        const { elements: { phases } } = Phases
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

        expect(() => Phases.updatePhase(workflow, id, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })
})
