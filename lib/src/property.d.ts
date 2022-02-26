import { BaseProperty } from 'admin-bro';
declare class Property extends BaseProperty {
    mongoosePath: any;
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
     * @param  {number}         position
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
    constructor(path: any, position?: number);
    instanceToType(mongooseInstance: any): "string" | "number" | "boolean" | "datetime" | "mixed" | "reference" | "float";
    name(): any;
    isEditable(): boolean;
    reference(): any;
    isVisible(): boolean;
    isId(): boolean;
    availableValues(): any;
    isArray(): boolean;
    subProperties(): Property[];
    type(): "string" | "number" | "boolean" | "datetime" | "mixed" | "reference" | "float";
    isSortable(): boolean;
    isRequired(): boolean;
}
export default Property;
