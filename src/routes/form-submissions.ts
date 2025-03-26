import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import prisma from '../db/db_client'
import { serializer } from './middleware/pre_serializer'
import { ISubmitFormAnswers } from './schemas/common'
import { ApiError } from '../errors'

async function formSubmissionRoutes(app: FastifyInstance) {
  app.setReplySerializer(serializer)

  const log = app.log.child({ component: 'formSubmissionRoutes' })

  app.post<{
    Body: ISubmitFormAnswers
  }>('/', {
    schema: {
      description: 'Submit form answers',
      tags: ['form submissions'],
      body: Type.Object({
        formId: Type.String(),
        answers: Type.Array(
          Type.Object({
            question: Type.String(),
            answer: Type.String(),
          })
        ),
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          answersCount: Type.Number(),
        }),
      },
    },
    async handler(req, reply) {
      const { formId, answers } = req.body
      log.debug({ formId }, 'create new form submission')

      try {
        const form = await prisma.form.findUniqueOrThrow({
          where: { id: formId },
        })

        const submission = await prisma.$transaction(async tx => {
          const sourceRecord = await tx.sourceRecord.create({
            data: {
              formId: form.id,
            },
          })

          const sourceData = await tx.sourceData.createMany({
            data: answers.map(answer => ({
              sourceRecordId: sourceRecord.id,
              question: answer.question,
              answer: answer.answer,
            })),
          })

          return {
            id: sourceRecord.id,
            answersCount: sourceData.count,
          }
        })

        reply.code(201).send(submission)
      } catch (err: any) {
        log.error({ err }, err.message)
        if (err.code === 'P2025') {
          throw new ApiError('Form not found', 404)
        }
        throw new ApiError('Failed to submit form answers', 500)
      }
    },
  })

  app.get<{
    Params: { formId: string }
  }>('/:formId', {
    schema: {
      description: 'Get all submissions for a specific form',
      tags: ['form submissions'],
      params: Type.Object({
        formId: Type.String(),
      }),
      response: {
        200: Type.Array(
          Type.Object({
            id: Type.String(),
            createdAt: Type.String(),
            answers: Type.Array(
              Type.Object({
                question: Type.String(),
                answer: Type.String(),
              })
            ),
          })
        ),
      },
    },
    async handler(req, reply) {
      const { formId } = req.params
      log.debug({ formId }, 'fetching form submissions')

      try {
        const submissions = await prisma.sourceRecord.findMany({
          where: { formId },
          include: {
            sourceData: {
              select: {
                question: true,
                answer: true,
              },
            },
          },
        })

        const formattedSubmissions = submissions.map(submission => ({
          id: submission.id,
          answers: submission.sourceData,
        }))

        return formattedSubmissions
      } catch (err: any) {
        log.error({ err }, err.message)
        throw new ApiError('Failed to fetch form submissions', 500)
      }
    },
  })
}

export default formSubmissionRoutes
