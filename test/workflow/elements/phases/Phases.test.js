const Command = require('../../../../src/workflow/elements/phases/commands/Command')
const {
  Phases,
  ApprovalEventListener,
} = require('../../../../src/workflow')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')
const testCollectionDefaultGetters = require('../helpers/testCollectionDefaultGetters')
const testAddMethod = require('../helpers/testAddMethod')

describe('Phases', () => {

  /* eslint-disable */
  testCollectionDefaultGetters(Phases)
  testAddMethod(Phases)
  /* eslint-enable */

  const createSinglePhaseWorkflow = () => {
    let wf = WorkflowGenerator.generate()
    wf = Phases.add(wf)
    const phase = Phases.getAll(wf)[0]
    return { phase, wf }
  }

  describe('remove', () => {
    it('removes a phase from the workflow', () => {
      let { phase, wf } = createSinglePhaseWorkflow()
      wf = Phases.add(wf)

      const { elements: { phases } } = Phases.remove(wf, phase.id)

      expect(phases).toHaveLength(1)
    })

    describe('when trying to remove the last phase', () => {
      it('throws an error', () => {
        let { phase, wf } = createSinglePhaseWorkflow()

        expect(() => Phases.remove(wf, phase.id))
          .toThrow(/Workflow has to contain at least one phase/)
      })
    })

    it('removes any attached event listeners', () => {
      let { phase, wf } = createSinglePhaseWorkflow()
      wf = Phases.add(wf)

      wf = ApprovalEventListener.add(wf, { phaseId: phase.id })
      wf = ApprovalEventListener.add(wf, { phaseId: phase.id })

      const { elements: { eventListeners } } = Phases.remove(wf, phase.id)

      expect(eventListeners).toHaveLength(0)
    })
  })

  describe('update', () => {
    describe('when the data is valid', () => {
      it('updates a phase on the workflow', () => {
        let { phase, wf } = createSinglePhaseWorkflow()
        const update = {
          commands: [
            {
              id: 'command_0',
              type: Command.TYPES.SET_TARGETS,
              data: {
                targets: [
                  { fctId: '1', slotName: 'value', target: 1 },
                ],
              },
            },
          ],
        }

        const { elements: { phases } } = Phases.update(wf, phase.id, update)

        expect(phases[0].commands).toHaveLength(1)
      })
    })

    describe('when the data is invalid', () => {
      it('throws an error', () => {
        let { phase, wf } = createSinglePhaseWorkflow()

        expect(() => Phases.update(wf, phase.id, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

  describe('setTargetValue', () => {
    const fctId = 'fct_0'
    const slotName = 'speed - with Keanu Reeves'
    const target = Math.random()

    describe('when there is no SET_TARGETS command in the phase yet', () => {
      it('adds a new SET_TARGETS command and sets the correct target', () => {
        let { phase, wf } = createSinglePhaseWorkflow()

        const updatedWf = Phases.setTargetValue(wf, phase.id, fctId, slotName, target)

        expect(updatedWf.elements.phases[0].commands[0].type).toBe(Command.TYPES.SET_TARGETS)
        expect(updatedWf.elements.phases[0].commands[0].id).toBe('command_0')
        expect(updatedWf.elements.phases[0].commands[0].data.targets[0]).toStrictEqual({
          fctId,
          slotName,
          target,
        })
      })
    })

    describe('when there is already a SET_TARGETS command in the phase', () => {
      it('does NOT create new SET_TARGETS command', () => {
        let { phase, wf } = createSinglePhaseWorkflow()
        const newTarget = Math.random()
        wf = Phases.setTargetValue(wf, phase.id, fctId, slotName, target)

        const updatedWf = Phases.setTargetValue(wf, phase.id, fctId, slotName, newTarget)

        expect(updatedWf.elements.phases[0].commands).toHaveLength(1)
      })

      describe('when there is NO target value for the given fctId and slotName yet', () => {
        it('creates a new target value in the command', () => {
          let { phase, wf } = createSinglePhaseWorkflow()
          const otherSlotName = 'speed - with Sandra Bullock'
          wf = Phases.setTargetValue(wf, phase.id, fctId, slotName, target)

          const updatedWf = Phases.setTargetValue(wf, phase.id, fctId, otherSlotName, target)

          expect(updatedWf.elements.phases[0].commands[0].data.targets[1]).toStrictEqual({
            fctId,
            slotName: otherSlotName,
            target,
          })
        })
      })

      describe('when there is already a target value for the given fctId and slotName', () => {
        it('updates the correct value in the command', () => {
          let { phase, wf } = createSinglePhaseWorkflow()
          const otherSlotName = 'speed - with Sandra Bullock'
          const newTarget = Math.random()
          wf = Phases.setTargetValue(wf, phase.id, fctId, slotName, target)
          wf = Phases.setTargetValue(wf, phase.id, fctId, otherSlotName, target)

          const updatedWf = Phases.setTargetValue(wf, phase.id, fctId, slotName, newTarget)

          expect(updatedWf.elements.phases[0].commands[0].data.targets).toHaveLength(2)
          expect(updatedWf.elements.phases[0].commands[0].data.targets[0]).toStrictEqual({
            fctId,
            slotName,
            target: newTarget,
          })
        })
      })
    })
  })

  describe('getTargetValue', () => {

    const createSetup = () => {
      let { phase, wf } = createSinglePhaseWorkflow()
      const fctId = 'fctId'
      const slotName = 'temperature'
      const target = Math.random()
      wf = Phases.setTargetValue(wf, phase.id, fctId, slotName, target)
      return { wf, phase, fctId, slotName, target }
    }

    describe('when there is a SET_TARGETS command', () => {
      describe('when there is a value set for the fctId and slotName', () => {
        it('returns the target value', () => {
          const { phase, wf, fctId, slotName, target } = createSetup()

          const res = Phases.getTargetValue(wf, phase.id, fctId, slotName)

          expect(res).toBe(target)
        })
      })

      describe('when there is NO value set for the fctId and slotName', () => {
        it('returns undefined', () => {
          const { phase, wf, fctId } = createSetup()
          const otherSlotName = 'ph'

          const res = Phases.getTargetValue(wf, phase.id, fctId, otherSlotName)

          expect(res).toBeUndefined()
        })
      })
    })
  })
})
