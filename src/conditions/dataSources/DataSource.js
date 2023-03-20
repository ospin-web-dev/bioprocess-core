const Joi = require('joi')

class DataSource {

  static get TYPES() {
    return {
      SENSOR_DATA: 'SENSOR_DATA',
      GATEWAY: 'GATEWAY',
    }
  }

  static get GATEWAY_PROPERTIES() {
    return ['activations']
  }

  static get DATA_SCHEMAS() {
    return {
      [DataSource.TYPES.SENSOR_DATA]: Joi.object({
        reporterFctId: Joi.string().required(),
      }),
      [DataSource.TYPES.GATEWAY]: Joi.object({
        gatewayId: Joi.string().required(),
        property: Joi.string().valid(...this.GATEWAY_PROPERTIES),
      }),
    }
  }

  static get SCHEMA() {
    return Joi.object({
      type: Joi.string().valid(...Object.values(DataSource.TYPES)).required(),
      data: Joi.any().when('type',
        {
          is: DataSource.TYPES.SENSOR_DATA,
          then: DataSource.DATA_SCHEMAS[DataSource.TYPES.SENSOR_DATA].required(),
        },
        {
          is: DataSource.TYPES.GATEWAY,
          then: DataSource.DATA_SCHEMAS[DataSource.TYPES.GATEWAY].required(),
          otherwise: Joi.forbidden(),
        }),
    })
  }

  static create(data) {
    return Joi.attempt(data, this.SCHEMA)
  }

}

module.exports = DataSource
