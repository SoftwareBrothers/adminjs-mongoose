const castError = require('../fixtures/mongoose-cast-error')
const castArrayError = require('../fixtures/mongoose-cast-array-error')

const createCastError = require('../../src/utils/create-cast-error')

describe('createCastError', function () {
  context('throwin cast error on update after one key has error', function () {
    beforeEach(function () {
      this.error = createCastError(castError)
    })

    it('has error for nested "parent.age" (errorKey) field', function () {
      expect(this.error.propertyErrors.age.type).to.equal('Number')
    })
  })

  context('throwing cast error on update when one array field has error', function () {
    beforeEach(function () {
      this.error = createCastError(castArrayError)
    })

    it('throws an error for root field', function () {
      expect(this.error.propertyErrors.authors.type).to.equal('ObjectId')
    })
  })
})
