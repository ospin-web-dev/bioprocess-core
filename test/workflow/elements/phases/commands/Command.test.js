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
              { fctId: '1', slotName: 'value', target: 'right' },
              { fctId: '2', slotName: 'value', target: 1 },
              { fctId: '3', slotName: 'value', target: 1.2 },
              { fctId: '4', slotName: 'value', target: true },
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
              { fctId: '1', slotName: 'value', target: 'right' },
            ],
          },
        }

        expect(() => Command.create(data)).toThrow(/id/)
      })
    })
  })
})
