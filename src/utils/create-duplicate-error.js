const { ValidationError } = require('admin-bro')

const createDuplicateError = ({ keyValue: duplicateEntry }) => {
  const [[keyName, keyValue]] = Object.entries(duplicateEntry)

  return new ValidationError({
    [keyName]: {
      type: 'duplicate',
      message: `Record with ${keyName}: '${keyValue}' already exists`,
    },
  })
}

module.exports = createDuplicateError
