const Joi = require('joi')

class DataSource {

  static get TYPES() {
    return {
      SENSOR_DATA: 'SENSOR_DATA',
    }
  }

  static get DATA_SCHEMAS() {
    return {
      [DataSource.TYPES.SENSOR_DATA]: Joi.object({
        fctId: Joi.string().required(),
        slotName: Joi.string().required(),
      }),
    }
  }

  static get SCHEMA() {
    return Joi.object({
      type: Joi.string().valid(...Object.values(DataSource.TYPES)).required(),
      data: Joi.any().when('type', {
        is: DataSource.TYPES.SENSOR_DATA,
        then: DataSource.DATA_SCHEMAS[DataSource.TYPES.SENSOR_DATA].required(),
        otherwise: Joi.forbidden(),
      }),
    })
  }

  static create(data) {
    return Joi.attempt(data, this.SCHEMA)
  }

}

module.exports = DataSource
