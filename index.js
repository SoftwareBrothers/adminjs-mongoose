/**
 * @module admin-bro-mongoose
 *
 * @description
 * ### A Mongoose database adapter for AdminBro.
 *
 * #### Installation
 *
 * To install the adapter run
 *
 * ```
 * yarn add admin-bro-mongoose
 * ```
 *
 * ### Usage
 *
 * In order to use it in your project register the adapter first:
 *
 * ```javascript
 * const AdminBro = require('admin-bro')
 * const AdminBroMongoose = require('admin-bro-mongoose')
 *
 * AdminBro.registerAdapter(AdminBroMongoose)
 * ```
 *
 * ### Passing an entire database
 *
 * You can now pass an entire database to {@link AdminBroOptions}
 *
 * ```javascript
 * const mongoose = require('mongoose')
 *
 * // even if we pass entire database, models have to be in scope
 * require('path-to-your/mongoose-model1)
 * require('path-to-your/mongoose-model2)
 *
 * const run = async () => {
 *   const connection = await mongoose.connect('mongodb://localhost:27017/test', {
 *     useNewUrlParser: true,
 *   })
 *   const AdminBro = new AdminBro({
 *     databases: [connection],
 *     //... other AdminBroOptions
 *   })
 *   //...
 * }
 * run()
 * ```
 *
 * > Notice, that we connected with the database BEFORE passing it to
 * > the **AdminBro({})** options. This is very important. Oterwise,
 * > AdminBro might not find any resources.
 *
 * ### Passing each resource
 *
 * Passing via _resource_ gives you the ability to add additional {@link ResourceOptions}
 *
 * ```javascript
 * const User = mongoose.model('User', { name: String, email: String, surname: String })
 *
 * const run = async () => {
 *   await mongoose.connect('mongodb://localhost:27017/test', {
 *     useNewUrlParser: true,
 *   })
 *   const AdminBro = new AdminBro({
 *     resources: [{
 *       resource: User,
 *       options: {
 *         //...
 *       }
 *     }],
 *     //... other AdminBroOptions
 *   })
 * }
 * ```
 */

/**
 * Implementation of {@link BaseDatabase} for Mongoose Adapter
 *
 * @type {typeof BaseDatabase}
 * @static
 */
const Database = require('./src/database')

/**
 * Implementation of {@link BaseResource} for Mongoose Adapter
 *
 * @type {typeof BaseResource}
 * @static
 */
const Resource = require('./src/resource')

module.exports = { Database, Resource }
