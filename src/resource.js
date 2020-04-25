/* eslint-disable no-param-reassign */

const {
  BaseResource,
  BaseRecord,
} = require('admin-bro')
const _ = require('lodash')
const { unflatten } = require('flat')
const Property = require('./property')
const convertFilter = require('./utils/convert-filter')
const createValidationError = require('./utils/create-validation-error')
const createDuplicateError = require('./utils/create-duplicate-error')
const createCastError = require('./utils/create-cast-error')

const {
  MONGOOSE_CAST_ERROR, MONGOOSE_DUPLICATE_ERROR_CODE, MONGOOSE_VALIDATION_ERROR,
} = require('./utils/errors')

/**
 * Adapter for mongoose resource
 * @private
 */
class Resource extends BaseResource {
  static isAdapterFor(MoongooseModel) {
    return _.get(MoongooseModel, 'base.constructor.name') === 'Mongoose'
  }

  /**
   * @typedef {Object} MongooseModel
   * @private
   * @see https://mongoosejs.com/docs/models.html
  */

  /**
   * Initialize the class with the Resource name
   * @param {MongooseModel} MongooseModel Class which subclass mongoose.Model
   * @memberof Resource
   */
  constructor(MongooseModel) {
    super(MongooseModel)
    this.dbType = 'mongodb'
    this.MongooseModel = MongooseModel
  }

  databaseName() {
    return this.MongooseModel.db.name
  }

  databaseType() {
    return this.dbType
  }

  name() {
    return this.MongooseModel.modelName
  }

  id() {
    return this.MongooseModel.modelName
  }

  properties() {
    return Object.entries(this.MongooseModel.schema.paths).map(([, path], position) => (
      new Property(path, position)
    ))
  }

  property(name) {
    const position = this.properties().findIndex(property => property.path() === name)
    if (position >= 0) {
      return this.properties()[position]
    }
    return null
  }

  async count(filters) {
    return this.MongooseModel.find(convertFilter(filters)).countDocuments()
  }

  async find(filters = {}, { limit = 20, offset = 0, sort = {} }) {
    const { direction, sortBy } = sort
    const sortingParam = { [sortBy]: direction }
    const mongooseObjects = await this.MongooseModel
      .find(convertFilter(filters))
      .skip(offset)
      .limit(limit)
      .sort(sortingParam)
    return mongooseObjects.map(mongooseObject => new BaseRecord(
      Resource.stringifyId(mongooseObject), this,
    ))
  }

  fillPopulatedData(baseRecord, path, recordsHash) {
    const id = baseRecord.param(path)
    if (recordsHash[id]) {
      const referenceRecord = new BaseRecord(
        Resource.stringifyId(recordsHash[id]), this,
      )
      baseRecord.populated[path] = referenceRecord
    }
  }

  async populate(baseRecords, property) {
    const ids = baseRecords.reduce((memo, baseRecord) => {
      if (property.isArray()) {
        const array = baseRecord.param(property.name()) || []
        return [...memo, ...array]
      }
      return [...memo, baseRecord.param(property.name())]
    }, [])
    const records = await this.MongooseModel.find({ _id: ids })
    const recordsHash = records.reduce((memo, record) => {
      memo[record._id] = record
      return memo
    }, {})

    baseRecords.forEach((baseRecord) => {
      if (property.isArray()) {
        const filtered = baseRecord.namespaceParams(property.name()) || {}
        for (const path of Object.keys(filtered)) {
          this.fillPopulatedData(baseRecord, path, recordsHash)
        }
      } else {
        this.fillPopulatedData(baseRecord, property.name(), recordsHash)
      }
    })
  }

  async findOne(id) {
    const mongooseObject = await this.MongooseModel.findById(id)
    return new BaseRecord(Resource.stringifyId(mongooseObject), this)
  }

  async findMany(ids) {
    const mongooseObjects = await this.MongooseModel.find({ _id: ids })
    return mongooseObjects.map(mongooseObject => (
      new BaseRecord(Resource.stringifyId(mongooseObject), this)
    ))
  }

  build(params) {
    return new BaseRecord(Resource.stringifyId(params), this)
  }

  async create(params) {
    const parsedParams = this.parseParams(params)
    let mongooseDocument = new this.MongooseModel(parsedParams)
    try {
      mongooseDocument = await mongooseDocument.save()
    } catch (error) {
      if (error.name === MONGOOSE_VALIDATION_ERROR) {
        throw createValidationError(error)
      }
      if (error.code === MONGOOSE_DUPLICATE_ERROR_CODE) {
        throw createDuplicateError(error, mongooseDocument.toJSON())
      }
      throw error
    }
    return mongooseDocument.toObject()
  }

  async update(id, params) {
    const parsedParams = this.parseParams(params)
    const unflattedParams = unflatten(parsedParams)
    try {
      const mongooseObject = await this.MongooseModel.findOneAndUpdate({
        _id: id,
      }, {
        $set: unflattedParams,
      }, {
        new: true,
        runValidators: true,
      })
      return mongooseObject.toObject()
    } catch (error) {
      if (error.name === MONGOOSE_VALIDATION_ERROR) {
        throw createValidationError(error)
      }
      if (error.code === MONGOOSE_DUPLICATE_ERROR_CODE) {
        throw createDuplicateError(error, unflattedParams)
      }
      // In update cast errors are not wrapped into a validation errors (as it happens in create).
      // that is why we have to have a different way of handling them - check out tests to see
      // example error
      if (error.name === MONGOOSE_CAST_ERROR) {
        throw createCastError(error)
      }
      throw error
    }
  }

  async delete(id) {
    return this.MongooseModel.findOneAndRemove({ _id: id })
  }

  static stringifyId(mongooseObj) {
    // By default Id field is an ObjectID and when we change entire mongoose model to
    // raw object it changes _id field not to a string but to an object.
    // stringify/parse is a path found here: https://github.com/Automattic/mongoose/issues/2790
    // @todo We can somehow speed this up
    const strinigified = JSON.stringify(mongooseObj)
    return JSON.parse(strinigified)
  }

  /**
   * Check all params against values they hold. In case of wrong value it corrects it.
   *
   * What it does esactly:
   * - changes all empty strings to `null`s for the ObjectID properties.
   * - changes all empty strings to [] for array fields
   *
   * @param   {Object}  params  received from AdminBro form
   *
   * @return  {Object}          converted params
   */
  parseParams(params) {
    const parasedParams = { ...params }

    // this function handles ObjectIDs and Arrays recursively
    const handleProperty = (prefix = '') => (property) => {
      const {
        path,
        schema,
        instance,
      } = property
      // mongoose doesn't supply us with the same path as we're using in our data
      // so we need to improvise
      const fullPath = [prefix, path].filter(Boolean).join('.')
      const value = parasedParams[fullPath]

      // this handles missing ObjectIDs
      if (instance === 'ObjectID') {
        if (value === '') {
          parasedParams[fullPath] = null
        }
      }

      // this handles empty Arrays or recurses into all properties of a filled Array
      if (instance === 'Array') {
        if (value === '') {
          parasedParams[fullPath] = []
        } else if (schema && schema.paths) { // we only want arrays of objects (with sub-paths)
          const subProperties = Object.values(schema.paths)
          // eslint-disable-next-line no-plusplus, no-constant-condition
          for (let i = 0; true; i++) { // loop over every item
            const newPrefix = `${fullPath}.${i}`
            if (parasedParams[newPrefix] === '') {
              // this means we have an empty object here
              parasedParams[newPrefix] = {}
            } else if (!Object.keys(parasedParams).some(key => key.startsWith(newPrefix))) {
              // we're past the last index of this array
              break
            } else {
              // recurse into the object
              subProperties.forEach(handleProperty(newPrefix))
            }
          }
        }
      }

      // this handles all properties of an object
      if (instance === 'Embedded') {
        if (parasedParams[fullPath] === '') {
          parasedParams[fullPath] = {}
        } else {
          const subProperties = Object.values(schema.paths)
          subProperties.forEach(handleProperty(fullPath))
        }
      }
    }

    this.properties().forEach(({ mongoosePath }) => handleProperty()(mongoosePath))

    return parasedParams
  }
}

module.exports = Resource
