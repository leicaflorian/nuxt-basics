const logger = require('../serverMiddleware/logger')

const express = require('express')
const cors = require('cors') // cors allow middleware
const app = express()
const settings = {
  routesPath: 'routes'
}

const routesPath = path.resolve(__dirname, settings.routesPath)

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(logger)

app.use(function (err, req, res, next) {
  console.error(err)
})

// Import API Routes
const availableRoutes = fs.readdirSync(routesPath)

for (const file of availableRoutes) {
  const Module = require(path.resolve(routesPath, file))

  if (Module) {
    const routeMiddleware = new Module()

    app.use(routeMiddleware.router)
  }
}

// Export express app
export default app

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}

