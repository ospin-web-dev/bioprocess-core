const swaggerJSDoc = require('swagger-jsdoc')

const generateSpecFile = () => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Workflow Definiton Schemas',
        version: '1.0.0.',
      },
    },
    apis: [
      'schemas/**/*.yml',
    ],
  }

  return swaggerJSDoc(options)
}

module.exports = generateSpecFile
