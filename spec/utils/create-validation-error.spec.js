const originalValidationError = require('../fixtures/mongoose-validation-error')
const nestedValidationError = require('../fixtures/mongoose-nested-validation-error')

const createValidationError = require('../../src/utils/create-validation-error')

describe('#createValidationError', function () {
  context('regular error', function () {
    beforeEach(function () {
      this.error = createValidationError(originalValidationError)
    })

    it('has errors', function () {
      expect(Object.keys(this.error.propertyErrors)).to.have.lengthOf(2)
    })

    it('has error for email', function () {
      expect(this.error.propertyErrors.email.type).to.equal('required')
    })
  })

  context('error for nested field', function () {
    beforeEach(function () {
      this.error = createValidationError(nestedValidationError)
    })

    it('2 errors, one for root field and one for an actual nested field', function () {
      expect(Object.keys(this.error.propertyErrors)).to.have.lengthOf(2)
    })

    it('has error for nested "parent.age" field', function () {
      expect(this.error.propertyErrors['parent.age'].type).to.equal('Number')
    })

    it('has error for "parent" field', function () {
      expect(this.error.propertyErrors.parent.type).to.equal('ValidationError')
    })
  })
})
