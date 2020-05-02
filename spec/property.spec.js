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

  describe('#isArray', function () {
    it('returns false for regular (not arrayed) property', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.isArray()).to.equal(false)
    })

    it('returns true for array property', function () {
      const property = new Property(User.schema.paths.arrayed)
      expect(property.isArray()).to.equal(true)
    })
  })

  describe('#type', function () {
    it('returns string type for string property', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.type()).to.equal('string')
    })

    it('returns string when property is an array of strings', function () {
      const property = new Property(User.schema.paths.arrayed)
      expect(property.type()).to.equal('string')
    })

    it('returns mixed when prooperty is an array of embeded schemas', function () {
      const property = new Property(User.schema.paths.family)
      expect(property.type()).to.equal('mixed')
    })
  })

  describe('#reference', function () {
    it('returns undefined when property without a reference is given', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.reference()).to.be.undefined
    })

    it('returns reference to User when field with it is given', function () {
      const property = new Property(Article.schema.paths.createdBy)
      expect(property.reference()).to.equal('User')
    })

    it('returns reference to User when field is an array fields with references', function () {
      const property = new Property(Article.schema.paths.owners)
      expect(property.reference()).to.equal('User')
    })
  })

  describe('#subProperties', function () {
    it('returns empty array for regular (not mixed) property', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.subProperties()).to.deep.equal([])
    })

    it('returns an array of all subproperties when nested schema is given', function () {
      const property = new Property(User.schema.paths.parent)
      const subProperties = property.subProperties()
      expect(subProperties).to.have.lengthOf(6)
    })

    it('returns an array of all subproperties when array of nested schema is given', function () {
      const property = new Property(User.schema.paths.family)
      const subProperties = property.subProperties()
      expect(subProperties).to.have.lengthOf(6)
    })
  })

  describe('#isRequired', function () {
    it('returns true for required property', function () {
      const property = new Property(User.schema.paths.email)
      expect(property.isRequired()).to.equal(true)
    })

    it('returns string when property is an array of strings', function () {
      const property = new Property(User.schema.paths.genre)
      expect(property.isRequired()).to.equal(false)
    })
  })
})
