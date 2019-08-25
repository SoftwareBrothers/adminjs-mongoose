/* eslint-disable no-param-reassign */

const {
  BaseResource,
  BaseRecord,
  ValidationError,
} = require('admin-bro')
const _ = require('lodash')
const { unflatten } = require('flat')
const Property = require('./property')
const convertFilter = require('./utils/convert-filter')

// Error thrown by mongoose in case of validation error
const MONGOOSE_VALIDATION_ERROR = 'ValidationError'

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
    const properties = []
    // eslint-disable-next-line no-unused-vars
    for (const [name, path] of Object.entries(this.MongooseModel.schema.paths)) {
      const prop = new Property(path)
      properties.push(prop)
    }
    return properties
  }

  property(name) {
    if (this.MongooseModel.schema.paths[name]) {
      return new Property(this.MongooseModel.schema.paths[name])
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

  build(params) {
    return new BaseRecord(params, this)
  }

  async create(params) {
    const parsedParams = this.parseParams(params)
    let mongooseDocument = new this.MongooseModel(parsedParams)
    try {
      mongooseDocument = await mongooseDocument.save()
    } catch (error) {
      if (error.name === MONGOOSE_VALIDATION_ERROR) {
        throw this.createValidationError(error)
      }
      throw error
    }
    return mongooseDocument.toObject()
  }

  async update(id, params) {
    const parsedParams = this.parseParams(params)
    try {
      const mongooseObject = await this.MongooseModel.findOneAndUpdate({
        _id: id,
      }, {
        $set: unflatten(parsedParams),
      }, {
        runValidators: true,
      })
      return mongooseObject.toObject()
    } catch (error) {
      if (error.name === MONGOOSE_VALIDATION_ERROR) {
        throw this.createValidationError(error)
      }
      throw error
    }
  }

  async delete(id) {
    return this.MongooseModel.deleteOne({ _id: id })
  }

  createValidationError(originalError) {
    const errors = Object.keys(originalError.errors).reduce((memo, key) => {
      const { path, message, kind } = originalError.errors[key]
      memo[path] = { message, kind } // eslint-disable-line no-param-reassign
      return memo
    }, {})
    return new ValidationError(`${this.name()} validation failed`, errors)
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
   * When user passes empty string as the value of property which is an ObjectID - mongo
   * will throw an error. This method changes all empty strings to `null`s for the
   * ObjectID properties.
   *
   * @param   {Object}  params  received from AdminBro form
   *
   * @return  {Object}          converted params
   */
  parseParams(params) {
    const parasedParams = { ...params }
    this.properties()
      .filter(p => p.mongoosePath.instance === 'ObjectID')
      .forEach((property) => {
        const value = parasedParams[property.name()]
        if (value === '') {
          parasedParams[property.name()] = null
        }
      })
    return parasedParams
  }
}

module.exports = Resource
