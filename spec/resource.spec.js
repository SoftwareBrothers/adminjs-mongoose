const mongoose = require('mongoose')
const { BaseRecord, ValidationError, Filter } = require('admin-bro')

const Resource = require('../src/resource')
const Property = require('../src/property')
const originalValidationError = require('./fixtures/mongoose-validation-error')
const nestedValidationError = require('./fixtures/mongoose-nested-validation-error')
const castError = require('./fixtures/mongoose-cast-error')
const castArrayError = require('./fixtures/mongoose-cast-array-error')

describe('Resource', function () {
  before(async function () {
    this.count = 12
    this.userRecords = await factory.createMany('user', this.count)
  })

  after(async function () {
    await User.deleteMany({})
  })

  describe('#createValidationError', function () {
    context('regular error', function () {
      beforeEach(function () {
        const resource = new Resource(User)
        this.error = resource.createValidationError(originalValidationError)
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
        const resource = new Resource(User)
        this.error = resource.createValidationError(nestedValidationError)
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

  describe('createCastError', function () {
    context('throwin cast error on update after one key has error', function () {
      const errorKey = 'parent.age' // because "castError" has been taken for this particular key

      beforeEach(function () {
        const resource = new Resource(User)
        this.error = resource.createCastError(castError, {
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
        const resource = new Resource(User)
        this.error = resource.createCastError(castArrayError, {
          'authors.1': castArrayError.value,
        })
      })

      it('throws an error for root field', function () {
        expect(this.error.propertyErrors['authors.1'].type).to.equal('ObjectId')
      })
    })
  })

  describe('#constructor', function () {
    it('stores original model', function () {
      const resource = new Resource(User)
      expect(resource.MongooseModel).to.equal(User)
    })
  })

  describe('#count', function () {
    beforeEach(function () {
      this.resource = new Resource(User)
    })

    it('returns given count without filters', async function () {
      expect(await this.resource.count(new Filter({}))).to.equal(this.count)
    })

    it('returns given count for given filters', async function () {
      expect(await this.resource.count(new Filter({
        email: 'some-not-existing-email',
      }, this.resource))).to.equal(0)
    })
  })

  describe('#parseParams', function () {
    beforeEach(function () {
      this.resource = new Resource(User)
    })

    it('converts empty strings to nulls for ObjectIDs', function () {
      expect(this.resource.parseParams({ _id: '' })).to.have.property('_id', null)
    })

    it('converts empty strings to [] for arrays', function () {
      expect(this.resource.parseParams({ family: '' })).to.deep.have.property('family', [])
    })
  })

  describe('#find', function () {
    beforeEach(async function () {
      this.resource = new Resource(User)
      this.limit = 5
      this.offset = 0
      this.ret = await this.resource.find(new Filter({}), {
        limit: this.limit,
        offset: this.offset,
      })
    })

    it('returns first n items', async function () {
      expect(this.ret.length).to.equal(this.limit)
    })

    it('returns elements of Record', async function () {
      expect(this.ret[0]).to.be.an.instanceof(BaseRecord)
    })
  })

  describe('#name', function () {
    it('returns name of the model', function () {
      this.resource = new Resource(User)
      expect(this.resource.name()).to.equal('User')
    })
  })

  describe('#properties', function () {
    beforeEach(function () {
      this.resource = new Resource(User)
      this.returnedProperties = this.resource.properties()
    })

    it('returns correct amount of properties', function () {
      // 8 because of implicite _id and __v properties
      expect(this.returnedProperties).to.have.lengthOf(8)
    })

    it('sets the position of properties', function () {
      expect(this.returnedProperties.map(p => p.position())).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7])
    })

    it('returns instances of Property class', async function () {
      expect(this.returnedProperties[0]).to.be.an.instanceof(Property)
    })

    context('Nested properties', function () {
      beforeEach(function () {
        const Nested = mongoose.model('Nested', new mongoose.Schema({
          field: {
            subfield: String,
            anotherSubField: String,
          },
        }))
        this.resource = new Resource(Nested)
        this.returnedProperties = this.resource.properties()
      })

      it('returns all fields', function () {
        expect(this.returnedProperties).to.have.lengthOf(4)
      })
    })
  })

  describe('#property', function () {
    beforeEach(function () {
      this.resource = new Resource(User)
      this.returnedProperty = this.resource.property('email')
    })

    it('returns selected property for an email', function () {
      expect(this.returnedProperty.name()).to.equal('email')
    })

    it('returns instance of Property class', function () {
      expect(this.returnedProperty).to.be.an.instanceof(Property)
    })
  })

  describe('#position', function () {
    it('returns position of a parent field', function () {
      const property = new Resource(User).property('parent')
      expect(property.position()).to.equal(4)
    })
  })

  describe('#create', function () {
    context('correct record', function () {
      beforeEach(async function () {
        this.params = { email: 'john@doe.com', passwordHash: 'somesecretpasswordhash' }
        this.resource = new Resource(User)
        this.record = await this.resource.create(this.params)
      })

      it('creates new object', async function () {
        expect(await this.resource.count()).to.equal(this.count + 1)
      })

      it('returns Object', function () {
        expect(this.record).to.be.an.instanceof(Object)
      })
    })

    context('record with validation errors', function () {
      beforeEach(async function () {
        this.params = { email: '', passwordHash: '' }
        this.resource = new Resource(User)
      })

      it('throws validation error', async function () {
        try {
          await this.resource.create(this.params)
        } catch (error) {
          expect(error).to.be.an.instanceOf(ValidationError)
        }
      })
    })

    context('record with cast errors in nested schema', function () {
      beforeEach(async function () {
        this.params = {
          email: 'a@a.pl',
          passwordHash: 'asdasdasd',
          parent: {
            age: 'not a number',
          },
        }
        this.resource = new Resource(User)
      })

      it('throws validation error', async function () {
        try {
          await this.resource.create(this.params)
        } catch (error) {
          expect(error).to.be.an.instanceOf(ValidationError)
          expect(error.propertyErrors['parent.age'].type).to.equal('Number')
          expect(error.propertyErrors.parent.type).to.equal('ValidationError')
        }
      })
    })

    context('id field passed as an empty string', function () {
      beforeEach(async function () {
        this.params = { content: '', createdBy: '' }
        this.resource = new Resource(Article)
      })

      afterEach(async function () {
        await Article.deleteMany({})
      })

      it('creates resource', async function () {
        await this.resource.create(this.params)
        const count = await this.resource.count()
        expect(count).to.equal(1)
      })
    })

    context('record with reference', function () {
      beforeEach(function () {
        this.params = { content: '', createdBy: this.userRecords[0]._id }
        this.resource = new Resource(Article)
      })

      afterEach(async function () {
        await Article.deleteMany({})
      })

      it('creates new resource', async function () {
        const res = await this.resource.create(this.params)
        expect(res.createdBy.toString()).to.equal(this.userRecords[0]._id.toString())
      })
    })
  })

  describe('#delete', function () {
    beforeEach(async function () {
      this.startCount = await User.countDocuments()
      this.idOfItemToDelete = this.userRecords[0]._id
      this.resource = new Resource(User)
      await this.resource.delete(this.idOfItemToDelete)
    })

    it('removes the item from the database', async function () {
      expect(await User.countDocuments()).to.equal(this.startCount - 1)
    })
  })

  describe('#populate', function () {
    context('record with reference', function () {
      beforeEach(async function () {
        this.params = { content: '', createdBy: this.userRecords[1]._id }
        this.resource = new Resource(Article)
        const res = await this.resource.create(this.params)
        this.record = await this.resource.findOne(res._id)
      })

      afterEach(async function () {
        await Article.deleteMany({})
      })

      it('populates the resource', async function () {
        const user = new Resource(User)
        await user.populate([this.record], this.resource.property('createdBy'))
        expect(this.record.populated.createdBy.param('email')).to.equal(this.userRecords[1].email)
      })
    })

    context('record with array of references', function () {
      beforeEach(async function () {
        this.params = {
          content: '',
          owners: [this.userRecords[2]._id, this.userRecords[3]._id],
        }
        this.resource = new Resource(Article)
        const res = await this.resource.create(this.params)
        this.record = await this.resource.findOne(res._id)
      })

      afterEach(async function () {
        await Article.deleteMany({})
      })

      it('populates all the nested fields in a resource', async function () {
        const user = new Resource(User)
        await user.populate([this.record], this.resource.property('owners'))
        expect(Object.keys(this.record.populated)).to.have.lengthOf(2)
        expect(this.record.populated['owners.0'].param('email')).to.equal(this.userRecords[2].email)
        expect(this.record.populated['owners.1'].param('email')).to.equal(this.userRecords[3].email)
      })
    })
  })
})
