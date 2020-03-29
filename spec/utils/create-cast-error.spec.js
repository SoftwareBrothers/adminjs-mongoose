const castError = require('../fixtures/mongoose-cast-error')
const castArrayError = require('../fixtures/mongoose-cast-array-error')

const createCastError = require('../../src/utils/create-cast-error')

describe('createCastError', function () {
  context('throwin cast error on update after one key has error', function () {
    const errorKey = 'parent.age' // because "castError" has been taken for this particular key

    beforeEach(function () {
      this.error = createCastError(castError, {
        otherKeyWithTheSameErrorValue: castError.value,
        [errorKey]: castError.value,
        otherKey: 'othervalue',
      })
    })

    it('has error for nested "parent.age" (errorKey) field', function () {
      expect(this.error.propertyErrors[errorKey].type).to.equal('Number')
    })
  })

  context('throwing cast error on update when one array field has error', function () {
    beforeEach(function () {
      this.error = createCastError(castArrayError, {
        'authors.1': castArrayError.value,
      })
    })

    it('throws an error for root field', function () {
      expect(this.error.propertyErrors['authors.1'].type).to.equal('ObjectId')
    })
  })
})
