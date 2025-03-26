import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { Form } from '@prisma/client'

import prisma from '../db/db_client'
import { serializer } from './middleware/pre_serializer'
import { ICreateFormBody, IEntityId } from './schemas/common'
import { ApiError } from '../errors'

async function formRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formRoutes' })

  app.get<{
    Reply: Form[]
  }>('/', {
    schema: {
      description: 'Get all forms',
      tags: ['forms'],
      response: {
        200: Type.Array(
          Type.Object({
            id: Type.String(),
            name: Type.String(),
            fields: Type.Object({
              type: Type.String({ default: 'object' }),
              title: Type.String(),
              required: Type.Array(Type.String()),
              properties: Type.Object({}),
            }),
          })
        ),
      },
    },
    async handler(req, reply) {
      log.debug('get all forms')
      try {
        const forms = await prisma.form.findMany()
        reply.send(forms)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch forms', 500)
      }
    },
  })

  app.get<{
    Params: IEntityId
    Reply: Form
  }>('/:id', {
    async handler(req, reply) {
      const { params } = req
      const { id } = params
      log.debug('get form by id')
      try {
        const form = await prisma.form.findUniqueOrThrow({ where: { id } })
        reply.send(form)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('failed to fetch form', 400)
      }
    },
  })

  app.post<{
    Body: ICreateFormBody
    Reply: Form
  }>('/', {
    schema: {
      description: 'Create a new form',
      tags: ['forms'],
      body: Type.Object({
        title: Type.String(),
        schema: Type.Object({}),
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          name: Type.String(),
          fields: Type.Object({}),
        }),
      },
    },
    async handler(req, reply) {
      const { title, schema } = req.body
      log.debug({ title }, 'create new form')

      try {
        const newForm = await prisma.form.create({
          data: {
            name: title,
            fields: schema,
          },
        })

        reply.code(201).send(newForm)
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to create form', 500)
      }
    },
  })
}

export default formRoutes
