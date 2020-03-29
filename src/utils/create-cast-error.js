const { ValidationError } = require('admin-bro')

const createCastError = (originalError, params) => {
  // cas error has only the nested path. So when an actual path is 'parents.age'
  // originalError will have just a 'age'. That is why we are finding first param
  // with the same value as the error has and path ending the same like path in
  // originalError or ending with path with array notation: "${path}.0"
  const pathRegex = new RegExp(`${originalError.path}(\\.\\d+)?$`)
  const errorParam = Object.entries(params).find(([key, value]) => (
    value === originalError.value && key.match(pathRegex)
  ))
  const errors = {
    [errorParam[0]]: {
      message: originalError.message,
      type: originalError.kind || originalError.name,
    },
  }
  return new ValidationError(errors)
}
module.exports = createCastError
