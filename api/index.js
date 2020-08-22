import logger       from '../serverMiddleware/logger'
import usersRoutes  from './routes/usersRoutes'
import filesRoutes  from './routes/filesRoutes'
import emailsRoutes from './routes/emailsRoutes'
import enumsRoutes  from './routes/enumsRoutes'

const express = require('express')
const cors    = require('cors') // cors allow middleware
const app     = express()

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(logger)

app.use(function (err, req, res, next) {
  console.error(err)
})

// Import API Routes
app.use(usersRoutes)
app.use(filesRoutes)
app.use(enumsRoutes)

if (process.env.NODE_ENV === 'development') {
  app.use(emailsRoutes)
}

// Export express app
export default app

// Start standalone server if directly running
if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${ port }`)
  })
}

