const Command = require('../../../../../src/workflow/elements/phases/commands/Command')

describe('Command', () => {

  describe('TYPES', () => {
    it('returns a map of all possible type', () => {
      const typesMap = Command.TYPES

      expect(typesMap).toStrictEqual({
        SET_TARGETS: 'SET_TARGETS',
      })
    })
  })

  describe('create', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', () => {
        const data = {
          id: 'command_0',
          type: Command.TYPES.SET_TARGETS,
          data: {
            targets: [
              { inputNodeId: 'b83983ff-76bf-460f-8014-91ff9af1d334', target: 'right' },
              { inputNodeId: '6093cc14-ec6f-492e-a25e-6470b6723914', target: 1 },
              { inputNodeId: '316a51d8-23f2-437d-9356-9d3d374c4831', target: 1.2 },
              { inputNodeId: '3dd46422-67f8-4ad5-8b27-98f877a5616a', target: true },
            ],
          },
        }

        expect(() => Command.create(data)).not.toThrow()
      })
    })

    describe('when the data is invalid', () => {
      it('does throw an error', () => {
        const data = {
          type: Command.TYPES.SET_TARGETS,
          data: {
            targets: [
              { inputNodeId: '8f4572b5-8d13-48b9-a096-88cfaec63e6d', target: 'right' },
            ],
          },
        }

        expect(() => Command.create(data)).toThrow(/id/)
      })
    })
  })
})
