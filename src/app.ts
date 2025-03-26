import fastify from 'fastify'

import formRoutes from './routes/form'
import formSubmissionRoutes from './routes/form-submissions'
import errorHandler from './errors'

function build(opts = {}) {
  const app = fastify({ ...opts, bodyLimit: 1048576 })

  const rateLimit =
    process.env.NODE_ENV === 'production'
      ? {
          max: 30,
          timeWindow: '1 minute',
        }
      : undefined

  app.register(formRoutes, {
    prefix: '/form',
    config: {
      rateLimit: rateLimit,
    },
  })
  app.register(formSubmissionRoutes, {
    prefix: '/form-submissions',
    config: {
      rateLimit: rateLimit,
    },
  })

  app.setErrorHandler(errorHandler)

  return app
}
export default build
