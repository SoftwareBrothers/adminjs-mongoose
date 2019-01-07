const {
  BaseResource,
  BaseRecord,
  ValidationError,
} = require('admin-bro')
const _ = require('lodash')
const ObjectId = require('mongodb').ObjectID;

const Property = require('./property')

// Error thrown by mongoose in case of validation error
const MONGOOSE_VALIDATION_ERROR = 'ValidationError'

/**
 * Adapter for mongoose resource
 */
class Resource extends BaseResource {
  static isAdapterFor(MoongooseModel) {
    return _.get(MoongooseModel, 'base.constructor.name') === 'Mongoose'
  }

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
    return this.MongooseModel.modelName.toLowerCase()
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
    return this.MongooseModel.find(this.convertedFilters(filters)).countDocuments()
  }

  convertedFilters(filters) {
    if(!filters) return {}
    const convertedFilters = {}
    Object.keys(filters).map(key => {
      const currentFilter = filters[key]
      if(currentFilter.from || currentFilter.to) {
        const { from, to } = currentFilter
        convertedFilters[key] = {
          ...from && { $gte: from },
          ...to && { $lte: to}
        }
      } else {
        convertedFilters[key] = {
          '$regex' : filters[key], '$options' : 'i' 
        } 
      }
    })
    return convertedFilters
  }
  
  async find(filters = {}, { limit = 20, offset = 0, sort = {} }) {
    const { direction, sortBy } = sort
    const sortingParam = { [sortBy]: direction }
    const mongooseObjects = await this.MongooseModel
      .find(this.convertedFilters(filters))
      .skip(offset)
      .limit(limit)
      .sort(sortingParam)
    return mongooseObjects.map(mongooseObject => new BaseRecord(
      this.convertMongooseObject(mongooseObject), this,
    ))
  }

  async findOne(id) {
    const mongooseObject = await this.MongooseModel.findById(id)
    return new BaseRecord(this.convertMongooseObject(mongooseObject), this)
  }

  build(params) {
    return new BaseRecord(params, this)
  }

  async create(params) {
    let mongooseDocument = new this.MongooseModel(params)
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
    try {
      const mongooseObject = await this.MongooseModel.findOneAndUpdate({
        _id: id,
      }, {
        $set: params,
      }, {
        runValidators: true,
      })
      return mongooseObject
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

  // eslint-disable-next-line class-methods-use-this
  convertMongooseObject(mongooseObj) {
    const obj = mongooseObj.toObject()

    // By default the _id field is an ObjectID, one of MongoDB's BSON
    // We have to convert this field to string for the flatten record params
    obj._id = obj._id.toString()
    return obj
  }
}

module.exports = Resource
