const Joi = require('joi')
const DataSource = require('../../../src/conditions/dataSources/DataSource')

describe('DataSource', () => {

  describe('TYPES', () => {
    it('returns a map of all possible type', () => {
      const typesMap = DataSource.TYPES

      expect(typesMap).toStrictEqual({
        SENSOR_DATA: 'SENSOR_DATA',
      })
    })
  })

  describe('DATA_SCHEMAS', () => {
    it('returns a map of all types with the joi schemas', () => {
      const dataSchemaMap = DataSource.DATA_SCHEMAS
      const types = Object.values(DataSource.TYPES)

      types.forEach(type => {
        expect(dataSchemaMap[type] instanceof Joi.constructor).toBe(true)
      })
    })
  })

  describe('create', () => {
    describe('when the data is valid', () => {
      it('does not throw an error', () => {
        const data = {
          type: DataSource.TYPES.SENSOR_DATA,
          data: { reporterFctId: '57fc5db1-b84e-4c23-ab0b-65a23ce58632' },
        }

        expect(() => DataSource.create(data)).not.toThrow()
      })
    })

    describe('when the data is invalid', () => {
      it('does throw an error', () => {
        const data = {
          type: 'FIRE',
          data: { reporterFctId: '57fc5db1-b84e-4c23-ab0b-65a23ce58632'},
        }

        expect(() => DataSource.create(data)).toThrow(/type/)
      })
    })
  })
})
