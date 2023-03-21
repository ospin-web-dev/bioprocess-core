const swaggerJSDoc = require('swagger-jsdoc')
const fs = require('fs')

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

  const schemaSpec = swaggerJSDoc(options)
  fs.writeFileSync('schemas/workflow-schemas.json', JSON.stringify(schemaSpec, null, 2))
}

generateSpecFile()
