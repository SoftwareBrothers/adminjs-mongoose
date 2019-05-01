const Property = require('../src/property')

describe('Property', function () {
  describe('#availableValues', function () {
    it('returns null for all standard (Non enum) values', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.availableValues()).to.equal(null)
    })

    it('returns array of values for the enum field', function () {
      const property = new Property(User.schema.paths.genre)
      expect(property.availableValues()).to.deep.equal(['male', 'female'])
    })
  })
})
