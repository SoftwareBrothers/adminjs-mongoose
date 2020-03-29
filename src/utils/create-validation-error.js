const { ValidationError } = require('admin-bro')

const createValidationError = (originalError) => {
  const errors = Object.keys(originalError.errors).reduce((memo, key) => {
    const { message, kind, name } = originalError.errors[key]
    return {
      ...memo,
      [key]: {
        message,
        type: kind || name,
      },
    }
  }, {})
  return new ValidationError(errors)
}

module.exports = createValidationError
