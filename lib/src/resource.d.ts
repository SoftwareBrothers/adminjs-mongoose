import { BaseResource } from 'admin-bro';
import mongoose from 'mongoose';
import { FindOptions } from './utils/filter.types';
import Property from './property';
/**
 * Adapter for mongoose resource
 * @private
 */
declare class Resource extends BaseResource {
    private readonly dbType;
    /**
     * @typedef {Object} MongooseModel
     * @private
     * @see https://mongoosejs.com/docs/models.html
     */
    readonly MongooseModel: mongoose.Model<any>;
    /**
     * Initialize the class with the Resource name
     * @param {MongooseModel} MongooseModel Class which subclass mongoose.Model
     * @memberof Resource
     */
    constructor(MongooseModel: any);
    static isAdapterFor(MoongooseModel: any): boolean;
    databaseName(): any;
    databaseType(): string;
    name(): any;
    id(): any;
    get selectFields(): string;
    properties(): Property[];
    property(name: string): Property;
    count(filters?: any): Promise<any>;
    find(filters: {}, { limit, offset, sort }: FindOptions): Promise<any>;
    findOne(id: string): Promise<any>;
    findMany(ids: string[]): Promise<any>;
    build(params: any): any;
    create(params: any): Promise<any>;
    update(id: any, params: any): Promise<any>;
    delete(id: any): Promise<any>;
    static stringifyId(mongooseObj: any): any;
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
    parseParams(params: any): any;
}
export default Resource;
