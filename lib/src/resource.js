"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_bro_1 = require("admin-bro");
const lodash_1 = require("lodash");
const property_1 = __importDefault(require("./property"));
const convert_filter_1 = require("./utils/convert-filter");
const create_validation_error_1 = require("./utils/create-validation-error");
const create_duplicate_error_1 = require("./utils/create-duplicate-error");
const create_cast_error_1 = require("./utils/create-cast-error");
const errors_1 = __importDefault(require("./utils/errors"));
const { MONGOOSE_CAST_ERROR, MONGOOSE_DUPLICATE_ERROR_CODE, MONGOOSE_VALIDATION_ERROR } = errors_1.default;
/**
 * Adapter for mongoose resource
 * @private
 */
class Resource extends admin_bro_1.BaseResource {
    /**
     * Initialize the class with the Resource name
     * @param {MongooseModel} MongooseModel Class which subclass mongoose.Model
     * @memberof Resource
     */
    constructor(MongooseModel) {
        super(MongooseModel);
        this.dbType = 'mongodb';
        this.MongooseModel = MongooseModel;
    }
    static isAdapterFor(MoongooseModel) {
        return lodash_1.get(MoongooseModel, 'base.constructor.name') === 'Mongoose';
    }
    databaseName() {
        return this.MongooseModel.db.name;
    }
    databaseType() {
        return this.dbType;
    }
    name() {
        return this.MongooseModel.modelName;
    }
    id() {
        return this.MongooseModel.modelName;
    }
    get selectFields() {
        return Object.keys(this.MongooseModel.schema.paths).join(' ');
    }
    properties() {
        return Object.entries(this.MongooseModel.schema.paths).map(([, path], position) => (new property_1.default(path, position)));
    }
    property(name) {
        var _a;
        return (_a = this.properties().find(property => property.path() === name)) !== null && _a !== void 0 ? _a : null;
    }
    async count(filters = null) {
        return this.MongooseModel.countDocuments(convert_filter_1.convertFilter(filters));
    }
    async find(filters = {}, { limit = 20, offset = 0, sort = {} }) {
        const { direction, sortBy } = sort;
        const sortingParam = {
            [sortBy]: direction,
        };
        const mongooseObjects = await this.MongooseModel
            .find(convert_filter_1.convertFilter(filters), {}, {
            skip: offset, limit, sort: sortingParam, select: this.selectFields
        });
        return mongooseObjects.map(mongooseObject => new admin_bro_1.BaseRecord(Resource.stringifyId(mongooseObject), this));
    }
    async findOne(id) {
        const mongooseObject = await this.MongooseModel.findById(id).select(this.selectFields);
        return new admin_bro_1.BaseRecord(Resource.stringifyId(mongooseObject), this);
    }
    async findMany(ids) {
        const mongooseObjects = await this.MongooseModel.find({ _id: ids }, {}, { select: this.selectFields });
        return mongooseObjects.map(mongooseObject => (new admin_bro_1.BaseRecord(Resource.stringifyId(mongooseObject), this)));
    }
    build(params) {
        return new admin_bro_1.BaseRecord(Resource.stringifyId(params), this);
    }
    async create(params) {
        const parsedParams = this.parseParams(params);
        let mongooseDocument = new this.MongooseModel(parsedParams);
        try {
            mongooseDocument = await mongooseDocument.save();
        }
        catch (error) {
            if (error.name === MONGOOSE_VALIDATION_ERROR) {
                throw create_validation_error_1.createValidationError(error);
            }
            if (error.code === MONGOOSE_DUPLICATE_ERROR_CODE) {
                throw create_duplicate_error_1.createDuplicateError(error, mongooseDocument.toJSON());
            }
            throw error;
        }
        return Resource.stringifyId(mongooseDocument.toObject());
    }
    async update(id, params) {
        const parsedParams = this.parseParams(params);
        const unflattedParams = admin_bro_1.flat.unflatten(parsedParams);
        try {
            const mongooseObject = await this.MongooseModel.findOneAndUpdate({
                _id: id,
            }, {
                $set: unflattedParams,
            }, {
                new: true,
                runValidators: true,
            });
            return Resource.stringifyId(mongooseObject.toObject());
        }
        catch (error) {
            if (error.name === MONGOOSE_VALIDATION_ERROR) {
                throw create_validation_error_1.createValidationError(error);
            }
            if (error.code === MONGOOSE_DUPLICATE_ERROR_CODE) {
                throw create_duplicate_error_1.createDuplicateError(error, unflattedParams);
            }
            // In update cast errors are not wrapped into a validation errors (as it happens in create).
            // that is why we have to have a different way of handling them - check out tests to see
            // example error
            if (error.name === MONGOOSE_CAST_ERROR) {
                throw create_cast_error_1.createCastError(error);
            }
            throw error;
        }
    }
    async delete(id) {
        return this.MongooseModel.findOneAndRemove({ _id: id });
    }
    static stringifyId(mongooseObj) {
        // By default Id field is an ObjectID and when we change entire mongoose model to
        // raw object it changes _id field not to a string but to an object.
        // stringify/parse is a path found here: https://github.com/Automattic/mongoose/issues/2790
        // @todo We can somehow speed this up
        const strinigified = JSON.stringify('toObject' in mongooseObj ? mongooseObj.toObject({ getters: true, virtuals: true }) : mongooseObj);
        return JSON.parse(strinigified);
    }
    /**
     * Check all params against values they hold. In case of wrong value it corrects it.
     *
     * What it does exactly:
     * - changes all empty strings to `null`s for the ObjectID properties.
     * - changes all empty strings to [] for array fields
     *
     * @param   {Object}  params  received from AdminBro form
     *
     * @return  {Object}          converted params
     */
    parseParams(params) {
        const parsedParams = { ...params };
        // this function handles ObjectIDs and Arrays recursively
        const handleProperty = (prefix = '') => (property) => {
            const { path, schema, instance, } = property;
            // mongoose doesn't supply us with the same path as we're using in our data
            // so we need to improvise
            const fullPath = [prefix, path].filter(Boolean).join('.');
            const value = parsedParams[fullPath];
            // this handles missing ObjectIDs
            if (instance === 'ObjectID') {
                if (value === '') {
                    parsedParams[fullPath] = null;
                }
                else if (value) {
                    // this works similar as this.stringifyId
                    parsedParams[fullPath] = value.toString();
                }
            }
            // this handles empty Arrays or recurse into all properties of a filled Array
            if (instance === 'Array') {
                if (value === '') {
                    parsedParams[fullPath] = [];
                }
                else if (schema && schema.paths) { // we only want arrays of objects (with sub-paths)
                    const subProperties = Object.values(schema.paths);
                    // eslint-disable-next-line no-plusplus, no-constant-condition
                    for (let i = 0; true; i++) { // loop over every item
                        const newPrefix = `${fullPath}.${i}`;
                        if (parsedParams[newPrefix] === '') {
                            // this means we have an empty object here
                            parsedParams[newPrefix] = {};
                        }
                        else if (!Object.keys(parsedParams).some(key => key.startsWith(newPrefix))) {
                            // we're past the last index of this array
                            break;
                        }
                        else {
                            // recurse into the object
                            subProperties.forEach(handleProperty(newPrefix));
                        }
                    }
                }
            }
            // this handles all properties of an object
            if (instance === 'Embedded') {
                if (parsedParams[fullPath] === '') {
                    parsedParams[fullPath] = {};
                }
                else {
                    const subProperties = Object.values(schema.paths);
                    subProperties.forEach(handleProperty(fullPath));
                }
            }
        };
        this.properties().forEach(({ mongoosePath }) => handleProperty()(mongoosePath));
        return parsedParams;
    }
}
exports.default = Resource;
//# sourceMappingURL=resource.js.map