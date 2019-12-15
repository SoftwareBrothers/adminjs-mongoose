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
 * ### Passing each resource
 *
 * Passing via _resource_ gives you the ability to add additional {@link ResourceOptions}
 *
 * ```javascript
 * const User = mongoose.model('User', { name: String, email: String, surname: String })
 *
 * const AdminBro = new AdminBro({
 *   resources: [{
 *     resource: User,
 *     options: {
 *       //...
 *     }
 *   }],
 *   //... other AdminBroOptions
 * })
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
