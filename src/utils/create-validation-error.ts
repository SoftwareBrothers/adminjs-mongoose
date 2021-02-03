import { ValidationError } from 'admin-bro'

export const createValidationError = (originalError): ValidationError => {
  let errors
  if (originalError.errors) {
    errors = Object.keys(originalError.errors).reduce((memo, key) => {
      const { message, kind, name } = originalError.errors[key]
      return {
        ...memo,
        [key]: {
          message,
          type: kind || name,
        },
      }
    }, {})
  }

  if (originalError.name && originalError.name === 'ValidationError') {
    errors = Object.keys(originalError.data).reduce((memo, key) => ({
      ...memo,
      [key]: {
        message: originalError.data[key],
        type: originalError.name,
      },
    }), {})
  }

  return new ValidationError(errors)
}
