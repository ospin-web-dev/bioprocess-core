const Joi = require('joi')
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

  describe('DATA_SCHEMAS', () => {
    it('returns a map of all types with the joi schemas', () => {
      const dataSchemaMap = Command.DATA_SCHEMAS
      const types = Object.values(Command.TYPES)

      types.forEach(type => {
        expect(dataSchemaMap[type] instanceof Joi.constructor).toBe(true)
      })
    })
  })

  describe('create', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', () => {
        const data = {
          id: 'command_0',
          type: Command.TYPES.SET_TARGETS,
          data: [
            { fctId: '1', slotName: 'value', target: 'right' },
            { fctId: '2', slotName: 'value', target: 1 },
            { fctId: '3', slotName: 'value', target: 1.2 },
            { fctId: '4', slotName: 'value', target: true },
          ],
        }

        expect(() => Command.create(data)).not.toThrow()
      })
    })

    describe('when the data is invalid', () => {
      it('does throw an error', () => {
        const data = {
          type: Command.TYPES.SET_TARGETS,
          data: [
            { fctId: '1', slotName: 'value', target: 'right' },
          ],
        }

        expect(() => Command.create(data)).toThrow(/id/)
      })
    })
  })
})
