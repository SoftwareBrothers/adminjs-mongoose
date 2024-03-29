import { Article, User } from './utils/models.js'

import Property from '../src/property.js'

describe('Property', () => {
  describe('#availableValues', () => {
    it('returns null for all standard (Non enum) values', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.availableValues()).toEqual(null)
    })

    it('returns array of values for the enum field', () => {
      const property = new Property(User.schema.paths.genre)
      expect(property.availableValues()).toEqual(['male', 'female'])
    })
  })

  describe('#isArray', () => {
    it('returns false for regular (not arrayed) property', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.isArray()).toEqual(false)
    })

    it('returns true for array property', () => {
      const property = new Property(User.schema.paths.arrayed)
      expect(property.isArray()).toEqual(true)
    })
  })

  describe('#type', () => {
    it('returns string type for string property', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.type()).toEqual('string')
    })

    it('returns string when property is an array of strings', () => {
      const property = new Property(User.schema.paths.arrayed)
      expect(property.type()).toEqual('string')
    })

    it('returns mixed when prooperty is an array of embeded schemas', () => {
      const property = new Property(User.schema.paths.family)
      expect(property.type()).toEqual('mixed')
    })
  })

  describe('#reference', () => {
    it('returns undefined when property without a reference is given', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.reference()).toEqual(undefined)
    })

    it('returns reference to User when field with it is given', () => {
      const property = new Property(Article.schema.paths.createdBy)
      expect(property.reference()).toEqual('User')
    })

    it('returns reference to User when field is an array fields with references', () => {
      const property = new Property(Article.schema.paths.owners)
      expect(property.reference()).toEqual('User')
    })
  })

  describe('#subProperties', () => {
    it('returns empty array for regular (not mixed) property', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.subProperties()).toEqual([])
    })

    it('returns an array of all subproperties when nested schema is given', () => {
      const property = new Property(User.schema.paths.parent)
      const subProperties = property.subProperties()
      expect(subProperties.length).toEqual(6)
    })

    it('returns an array of all subproperties when array of nested schema is given', () => {
      const property = new Property(User.schema.paths.family)
      const subProperties = property.subProperties()
      expect(subProperties.length).toEqual(6)
    })
  })

  describe('#isRequired', () => {
    it('returns true for required property', () => {
      const property = new Property(User.schema.paths.email)
      expect(property.isRequired()).toEqual(true)
    })

    it('returns string when property is an array of strings', () => {
      const property = new Property(User.schema.paths.genre)
      expect(property.isRequired()).toEqual(false)
    })
  })
})
