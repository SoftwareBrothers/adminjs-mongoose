const { BaseProperty } = require('admin-bro')

const ID_PROPERTY = '_id'

// __v indicates versionKey in mongoose
const VERSION_KEY_PROPERTY = '__v'

class Property extends BaseProperty {
  /**
   * Crates an object from mongoose schema path
   *
   * @param  {SchemaString}   path
   * @param  {String[]}       path.enumValues
   * @param  {String}         path.regExp
   * @param  {String}         path.path
   * @param  {String}         path.instance
   * @param  {Object[]}       path.validators
   * @param  {Object[]}       path.setters
   * @param  {Object[]}       path.getters
   * @param  {Object}         path.options
   * @param  {Object}         path._index
   *
   * @private
   *
   * @example
   *
   * const schema = new mongoose.Schema({
   *   email: String,
   * })
   *
   * property = new Property(schema.paths.email))
   */
  constructor(path, position = 0) {
    super({ path: path.path })
    this._position = position
    this.mongoosePath = path
  }

  instanceToType(mongooseInstance) {
    switch (mongooseInstance) {
    case 'String':
      return 'string'
    case 'Boolean':
      return 'boolean'
    case 'Number':
      return 'number'
    case 'Date':
      return 'datetime'
    case 'Embedded':
      return 'mixed'
    case 'ObjectID':
      if (this.reference()) {
        return 'reference'
      }
      return 'id'
    case 'Decimal128':
      return 'float'
    default:
      return 'string'
    }
  }

  name() {
    return this.mongoosePath.path
  }

  isEditable() {
    return this.name() !== VERSION_KEY_PROPERTY && this.name() !== ID_PROPERTY
  }

  reference() {
    if (this.isArray()) {
      return this.mongoosePath.caster.options && this.mongoosePath.caster.options.ref
    }
    return this.mongoosePath.options && this.mongoosePath.options.ref
  }

  isVisible() {
    // fields containing password are hidden by default
    return this.name() !== VERSION_KEY_PROPERTY && !this.name().match('password')
  }

  isId() {
    return this.name() === ID_PROPERTY
  }

  availableValues() {
    return this.mongoosePath.enumValues && this.mongoosePath.enumValues.length
      ? this.mongoosePath.enumValues
      : null
  }

  isArray() {
    return this.mongoosePath.instance === 'Array'
  }

  subProperties() {
    if (this.type() === 'mixed') {
      const subPaths = Object.values(this.mongoosePath.caster.schema.paths)
      return subPaths.map(p => new Property(p))
    }
    return []
  }

  position() {
    return this._position
  }

  type() {
    if (this.isArray()) {
      let { instance } = this.mongoosePath.caster
      // For array of embeded schemas mongoose returns null for caster.instance
      // That is why we have to check if caster has a schema
      if (!instance && this.mongoosePath.caster.schema) {
        instance = 'Embedded'
      }
      return this.instanceToType(instance)
    }
    return this.instanceToType(this.mongoosePath.instance)
  }

  isSortable() {
    return this.type() !== 'mixed' && !this.isArray()
  }

  isRequired() {
    return this.mongoosePath.validators
    && this.mongoosePath.validators.length
    && !!this.mongoosePath.validators.find(validator => validator.type === 'required')
  }
}

module.exports = Property
