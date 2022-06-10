const Phase = require('../../../../src/workflow/elements/phases/Phase')
const ApprovalEventListener = require('../../../../src/workflow/elements/eventListeners/ApprovalEventListener')
const Command = require('../../../../src/workflow/elements/phases/commands/Command')
const Phases = require('../../../../src/workflow/elements/phases/Phases')

const WorkflowGenerator = require('../../../helpers/generators/WorkflowGenerator')

describe('Phases', () => {
  describe('add', () => {
    describe('when the data is valid', () => {
      it('adds a new phase to the workflow', () => {
        const workflow = WorkflowGenerator.generate()

        const { elements: { phases } } = Phases.add(workflow)

        expect(phases).toHaveLength(1)
        expect(phases[0].id).toBe('phase_0')
      })
    })

    describe('when the data is invalid', () => {
      it('throws an error', () => {
        const workflow = WorkflowGenerator.generate()

        expect(() => Phases.add(workflow, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

  describe('remove', () => {
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

      const { elements: { phases } } = Phases.remove(workflow, id1)

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

        expect(() => Phases.remove(workflow, id))
          .toThrow(/Workflow has to contain at least one phase/)
      })
    })

    it('removes any attached event listeners', () => {
      const id0 = 'phase_0'
      const id1 = 'phase_0'
      const id2 = 'eventListener_0'
      const id3 = 'eventListener_1'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({ id: id0 }),
            Phase.create({ id: id1 }),
          ],
          eventListeners: [
            ApprovalEventListener.create({ id: id2, phaseId: id1 }),
            ApprovalEventListener.create({ id: id3, phaseId: id1 }),
          ],
        },
      })

      const { elements: { eventListeners } } = Phases.removePhase(workflow, id1)

      expect(eventListeners).toHaveLength(0)
    })
  })

  describe('update', () => {
    describe('when the data is valid', () => {
      it('updates a phase on the workflow', () => {
        const id = 'phase_0'
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
        const workflow = WorkflowGenerator.generate({
          elements: {
            phases: [
              Phase.create({ id }),
            ],
          },
        })

        const { elements: { phases } } = Phases
          .update(workflow, id, update)

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

        expect(() => Phases.update(workflow, id, { acceptMe: 'senpai' }))
          .toThrow(/"acceptMe" is not allowed/)
      })
    })
  })

  describe('setTargetValue', () => {
    const phaseId = 'phase_0'
    const fctId = 'fct_0'
    const slotName = 'speed - with Keanu Reeves'
    const target = Math.random()

    describe('when there is no SET_TARGETS command in the phase yet', () => {
      it('adds a new SET_TARGETS command and sets the correct target', () => {
        const workflow = WorkflowGenerator.generate({
          elements: {
            phases: [
              Phase.create({ id: phaseId }),
            ],
          },
        })

        const updatedWf = Phases.setTargetValue(workflow, phaseId, fctId, slotName, target)

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
        const workflow = WorkflowGenerator.generate({
          elements: {
            phases: [
              Phase.create({
                id: phaseId,
                commands: [
                  { id: 'command_0', type: Command.TYPES.SET_TARGETS, data: { targets: [] } },
                ],
              }),
            ],
          },
        })

        const updatedWf = Phases.setTargetValue(workflow, phaseId, fctId, slotName, target)

        expect(updatedWf.elements.phases[0].commands).toHaveLength(1)
      })

      describe('when there is NO target value for the given fctId and slotName yet', () => {
        it('creates a new target value in the command', () => {
          const workflow = WorkflowGenerator.generate({
            elements: {
              phases: [
                Phase.create({
                  id: phaseId,
                  commands: [
                    { id: 'command_0', type: Command.TYPES.SET_TARGETS, data: { targets: [ ] } },
                  ],
                }),
              ],
            },
          })

          const updatedWf = Phases.setTargetValue(workflow, phaseId, fctId, slotName, target)

          expect(updatedWf.elements.phases[0].commands[0].data.targets[0]).toStrictEqual({
            fctId,
            slotName,
            target,
          })
        })
      })

      describe('when there is already a target value for the given fctId and slotName yet', () => {
        it('updates a target value in the command', () => {
          const newTarget = Math.random()
          const workflow = WorkflowGenerator.generate({
            elements: {
              phases: [
                Phase.create({
                  id: phaseId,
                  commands: [
                    {
                      id: 'command_0',
                      type: Command.TYPES.SET_TARGETS,
                      data: {
                        targets: [
                          { fctId, slotName, target },
                          { fctId: 'fct_2', slotName: 'speed with Sandra Bullock', target: Math.random() },
                        ],
                      },
                    },
                  ],
                }),
              ],
            },
          })

          const updatedWf = Phases.setTargetValue(workflow, phaseId, fctId, slotName, newTarget)

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

  describe('removeCommand', () => {
    it('removes a command by Id', () => {
      const phaseId = 'phase_0'
      const commandId = 'command_0'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({
              id: phaseId,
              commands: [
                {
                  id: 'command_0',
                  type: Command.TYPES.SET_TARGETS,
                  data: {
                    targets: [],
                  },
                },
              ],
            }),
          ],
        },
      })

      const updatedWf = Phases.removeCommand(workflow, phaseId, commandId)

      expect(updatedWf.elements.phases[0].commands).toHaveLength(0)
    })
  })

  describe('getTargetValue', () => {
    describe('when there is a SET_TARGETS command', () => {
      describe('when there is a value set for the fctId and slotName', () => {
        it('returns the target value', () => {
          const phaseId = 'phase_0'
          const fctId = 'fctId'
          const slotName = 'temperature'
          const target = Math.random()
          const workflow = WorkflowGenerator.generate({
            elements: {
              phases: [
                Phase.create({
                  id: phaseId,
                  commands: [{
                    id: 'command_0',
                    type: Command.TYPES.SET_TARGETS,
                    data: {
                      targets: [
                        { fctId, slotName, target },
                      ],
                    },
                  }],
                }),
              ],
            },
          })

          const res = Phases.getTargetValue(workflow, phaseId, fctId, slotName)

          expect(res).toBe(target)
        })
      })

      describe('when there is NO value set for the fctId and slotName', () => {
        it('returns undefined', () => {
          const phaseId = 'phase_0'
          const fctId = 'fctId'
          const slotName = 'temperature'
          const workflow = WorkflowGenerator.generate({
            elements: {
              phases: [
                Phase.create({
                  id: phaseId,
                  commands: [{
                    id: 'command_0',
                    type: Command.TYPES.SET_TARGETS,
                    data: {
                      targets: [],
                    },
                  }],
                }),
              ],
            },
          })

          const res = Phases.getTargetValue(workflow, phaseId, fctId, slotName)

          expect(res).toBeUndefined()
        })
      })
    })
  })

  describe('generateUniqueCommandId', () => {
    it('generates a unqiue commandId', () => {
      const phaseId = 'phase_0'
      const workflow = WorkflowGenerator.generate({
        elements: {
          phases: [
            Phase.create({
              id: phaseId,
              commands: [
                {
                  id: 'command_0',
                  type: Command.TYPES.SET_TARGETS,
                  data: {
                    targets: [],
                  },
                },
              ],
            }),
          ],
        },
      })

      const uniqueId = Phases.generateUniqueCommandId(workflow, phaseId)
      expect(uniqueId).toBe('command_1')
    })
  })
})
