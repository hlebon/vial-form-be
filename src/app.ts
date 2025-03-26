import fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import formRoutes from './routes/form'
import formSubmissionRoutes from './routes/form-submissions'
import errorHandler from './errors'

async function build(opts = {}) {
  const app = fastify({ ...opts, bodyLimit: 1048576 })

  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Forms API Documentation',
        description: 'API documentation for Forms service',
        version: '1.0.0',
      },
      host: 'localhost:8080',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  })

  // Configuración de Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  })

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
