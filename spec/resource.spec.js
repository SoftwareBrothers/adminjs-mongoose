const mongoose = require('mongoose')
const { BaseRecord, ValidationError, Filter } = require('admin-bro')

const Resource = require('../src/resource')
const Property = require('../src/property')

describe('Resource', function () {
  before(async function () {
    this.count = 12
    this.userRecords = await factory.createMany('user', this.count)
  })

  after(async function () {
    await User.deleteMany({})
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
        this.params = {
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
          'parent.age': 'not a number',
        }
        this.resource = new Resource(User)
      })

      it('throws validation error', async function () {
        try {
          await this.resource.create(this.params)
          expect(true).to.equal(false)
        } catch (error) {
          expect(error).to.be.an.instanceOf(ValidationError)
          expect(error.propertyErrors['parent.age'].type).to.equal('Number')
          expect(error.propertyErrors.parent.type).to.equal('ValidationError')
        }
      })
    })

    describe('record with unique field', function () {
      let resource
      const createPesel = pesel => resource.create({ pesel })

      beforeEach(() => {
        resource = new Resource(Pesel)
      })

      it('throws duplicate error', async function () {
        try {
          await createPesel('1')
          await createPesel('1')
        } catch (error) {
          expect(error).to.be.an.instanceOf(ValidationError)
          expect(error.propertyErrors.pesel.type).to.equal('duplicate')
        }
      })
    })

    context('id field passed as an empty string', function () {
      beforeEach(async function () {
        this.params = { content: 'some content', createdBy: '' }
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

    context('record with nested array', function () {
      beforeEach(async function () {
        this.params = {
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

      it('creates new object', async function () {
        this.resource = new Resource(User)
        const countBefore = await this.resource.count()
        this.record = await this.resource.create(this.params)
        const countAfter = await this.resource.count()
        expect(countAfter - countBefore).to.equal(1)
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

  describe('#update', function () {
    beforeEach(async function () {
      this.params = {
        content: 'Test content',
      }
      this.resource = new Resource(Article)
      const res = await this.resource.create(this.params)
      this.recordId = res._id
    })

    afterEach(async function () {
      await Article.deleteMany({})
    })

    it('change record and return updated', async function () {
      const article = await this.resource.update(
        this.recordId,
        { content: 'Updated content' },
      )

      expect(article.content).to.equal('Updated content')
    })
  })
})
