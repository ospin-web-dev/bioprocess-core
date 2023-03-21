const fs = require('fs')
const generateSpec = require('./generateSchemas')
const generateTemplate = require('./generateTemplate')

const generateSchemaDocs = () => {
  /* because most templates refuse to render schemas without endpoints, we use the swagger
  /* default template and hack it by embedding the spec as string into a handwritten HTML template
  /* because this is just a temporary solution, I can live with that */
  const schemaSpec = generateSpec()
  const specAsString = JSON.stringify(schemaSpec, null, 2)
  const html = generateTemplate(specAsString)

  fs.writeFileSync('docs/index.html', html)
}

generateSchemaDocs()
