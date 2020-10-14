
import { BaseRecord, Filter, ValidationError } from 'admin-bro'

import mongoose from 'mongoose'
import { factory } from 'factory-girl'
import Resource from '../src/resource'
import Property from '../src/property'
import { Article, Pesel, User } from './utils/models'


describe('Resource', () => {
  let count: number
  let userRecords: any
  let resource
  let params

  beforeEach(async () => {
    count = 12
    userRecords = await factory.createMany('user', count)
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  describe('#constructor', () => {
    it('stores original model', () => {
      const userResource = new Resource(User)
      expect(userResource.MongooseModel).toEqual(User)
    })
  })

  describe('#count', () => {
    beforeEach(() => {
      resource = new Resource(User)
    })

    it('returns given count without filters', async () => {
      expect(await resource.count(new Filter({}, resource))).toEqual(count)
    })

    it('returns given count for given filters', async () => {
      expect(await resource.count(new Filter({
        email: 'some-not-existing-email',
      }, resource))).toEqual(0)
    })
  })

  describe('#parseParams', () => {
    beforeEach(() => {
      resource = new Resource(User)
    })

    it('converts empty strings to nulls for ObjectIDs', () => {
      expect(resource.parseParams({ _id: '' })).toHaveProperty('_id', null)
    })

    it('converts empty strings to [] for arrays', () => {
      expect(resource.parseParams({ family: '' })).toHaveProperty('family', [])
    })
  })

  describe('#find', () => {
    let limit
    let offset
    let ret

    beforeEach(async () => {
      resource = new Resource(User)
      limit = 5
      offset = 0
      ret = await resource.find(new Filter({}, User), {
        limit,
        offset,
      })
    })

    it('returns first n items', async () => {
      expect(ret.length).toEqual(limit)
    })

    it('returns elements of Record', async () => {
      expect(ret[0]).toBeInstanceOf(BaseRecord)
    })
  })

  describe('#name', () => {
    it('returns name of the model', () => {
      resource = new Resource(User)
      expect(resource.name()).toEqual('User')
    })
  })

  describe('#properties', () => {
    let returnedProperties

    beforeEach(() => {
      resource = new Resource(User)
      returnedProperties = resource.properties()
    })

    it('returns correct amount of properties', () => {
      // 8 because of implicite _id and __v properties
      expect(returnedProperties.length).toEqual(8)
    })

    it('sets the position of properties', () => {
      expect(returnedProperties.map(p => p.position())).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns instances of Property class', async () => {
      expect(returnedProperties[0]).toBeInstanceOf(Property)
    })

    describe('Nested properties', () => {
      beforeEach(() => {
        const Nested = mongoose.model('Nested', new mongoose.Schema({
          field: {
            subfield: String,
            anotherSubField: String,
          },
        }))
        resource = new Resource(Nested)
        returnedProperties = resource.properties()
      })

      it('returns all fields', () => {
        expect(returnedProperties.length).toEqual(4)
      })
    })
  })

  describe('#property', () => {
    let returnedProperty

    beforeEach(() => {
      resource = new Resource(User)
      returnedProperty = resource.property('email')
    })

    it('returns selected property for an email', () => {
      expect(returnedProperty.name()).toEqual('email')
    })

    it('returns instance of Property class', () => {
      expect(returnedProperty).toBeInstanceOf(Property)
    })
  })

  describe('#position', () => {
    it('returns position of a parent field', () => {
      const property = new Resource(User).property('parent')
      expect(property.position()).toEqual(4)
    })
  })

  describe('#create', () => {
    describe('correct record', () => {
      let record
      beforeEach(async () => {
        params = {
          email: 'john@doe.com',
          passwordHash: 'somesecretpasswordhash',
          'genre.type': 'some type',
          'genre.enum': 'male',
          'arrayed.0': 'first',
          'arrayed.1': 'second',
          'parent.name': 'name',
          'parent.surname': 'surname',
          'parent.age': 12,
          'parent.nestedArray.0.someProperty': 12,
          'parent.nestedArray.1.someProperty': 12,
          'parent.nestedObject.someProperty': 12,
          'family.0.name': 'some string',
          'family.0.surname': 'some string',
          'family.0.age': 13,
          'family.0.nestedArray.0.someProperty': 12,
          'family.0.nestedArray.1.someProperty': 12,
          'family.0.nestedObject.someProperty': 12,
          'family.1.name': 'some string',
          'family.1.surname': 'some string',
          'family.1.age': 14,
          'family.1.nestedArray.0.someProperty': 12,
          'family.1.nestedArray.1.someProperty': 12,
          'family.1.nestedObject.someProperty': 12,
        }
        resource = new Resource(User)
        record = await resource.create(params)
      })

      it('creates new object', async () => {
        expect(await resource.count()).toEqual(count + 1)
      })

      it('returns Object', () => {
        expect(record).toBeInstanceOf(Object)
      })
    })

    describe('record with validation errors', () => {
      beforeEach(async () => {
        resource = new Resource(User)
      })

      it('throws validation error', async () => {
        try {
          await resource.create({ email: '', passwordHash: '' })
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
        }
      })
    })

    describe('record with cast errors in nested schema', () => {
      beforeEach(async () => {
        params = {
          email: 'a@a.pl',
          passwordHash: 'asdasdasd',
          'parent.age': 'not a number',
        }
        resource = new Resource(User)
      })

      it('throws validation error', async () => {
        try {
          await resource.create(params)
          expect(true).toEqual(false)
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
          expect(error.propertyErrors['parent.age'].type).toEqual('Number')
          expect(error.propertyErrors.parent.type).toEqual('ValidationError')
        }
      })
    })

    describe('record with unique field', () => {
      let peselResource
      const createPesel = pesel => peselResource.create({ pesel })

      beforeEach(() => {
        peselResource = new Resource(Pesel)
      })

      it('throws duplicate error', async () => {
        try {
          await createPesel('1')
          await createPesel('1')
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
          expect(error.propertyErrors.pesel.type).toEqual('duplicate')
        }
      })
    })

    describe('id field passed as an empty string', () => {
      beforeEach(async () => {
        params = { content: 'some content', createdBy: '' }
        resource = new Resource(Article)
      })

      afterEach(async () => {
        await Article.deleteMany({})
      })

      it('creates resource', async () => {
        await resource.create(params)
        const recordsCount = await resource.count()
        expect(recordsCount).toEqual(1)
      })
    })

    describe('record with reference', () => {
      beforeEach(() => {
        params = { content: '', createdBy: userRecords[0]._id }
        resource = new Resource(Article)
      })

      afterEach(async () => {
        await Article.deleteMany({})
      })

      it('creates new resource', async () => {
        const res = await resource.create(params)
        expect(res.createdBy.toString()).toEqual(userRecords[0]._id.toString())
      })
    })

    describe('record with nested array', () => {
      beforeEach(async () => {
        params = {
          email: 'john@doe.com',
          passwordHash: 'somesecretpasswordhash',
          'parent.name': 'name',
          'parent.nestedArray': '',
          'parent.nestedObject': '',
          'family.0.name': 'some string',
          'family.0.nestedArray.0': '',
          'family.1': '',
        }
      })

      it('creates new object', async () => {
        resource = new Resource(User)
        const countBefore = await resource.count()
        await resource.create(params)
        const countAfter = await resource.count()
        expect(countAfter - countBefore).toEqual(1)
      })
    })
  })
})
