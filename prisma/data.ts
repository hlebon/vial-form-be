import { randomUUID } from 'crypto'

const data = {
  type: 'object',
  title: 'Vial Form Example',
  required: [],
  properties: {
    'textfield-1742941049996-431': {
      type: 'string',
      title: 'First Name',
      default: '',
    },
    'textfield-17429423249996-431': {
      type: 'string',
      title: 'Last Name',
      default: '',
    },
    'agefield-1742941049996-434': { type: 'integer', title: 'Age', minimum: 0 },
  },
}

export const getSeedData = async () => {
  const formData = [
    {
      id: randomUUID(),
      name: data.title,
      fields: data,
    },
  ]

  const sourceRecordData = [
    {
      id: randomUUID(),
      formId: formData[0].id,
    },
  ]

  const sourceData = [
    {
      id: randomUUID(),
      sourceRecordId: sourceRecordData[0].id,
      question: 'First Name',
      answer: 'John',
    },
    {
      id: randomUUID(),
      sourceRecordId: sourceRecordData[0].id,
      question: 'Last Name',
      answer: 'Doe',
    },
  ]

  return {
    formData,
    sourceRecordData,
    sourceData,
  }
}
