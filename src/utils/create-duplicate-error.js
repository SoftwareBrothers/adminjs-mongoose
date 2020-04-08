const { ValidationError } = require('admin-bro')

const createDuplicateError = (error) => {
  console.log(error)
  const { keyValue: duplicateEntry } = error
  const [[keyName, keyValue]] = Object.entries(duplicateEntry)

  return new ValidationError({
    [keyName]: {
      type: 'duplicate',
      message: `Record with ${keyName}: '${keyValue}' already exists`,
    },
  })
}

module.exports = createDuplicateError
