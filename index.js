/**
 * @module admin-bro-mongoose
 *
 * @description
 * A mongoose database adapter for AdminBro.
 */

/**
 * @type {typeof BaseDatabase}
 * @static
 */
const Database = require('./src/database')

/**
 * @type {typeof BaseResource}
 * @static
 */
const Resource = require('./src/resource')

module.exports = { Database, Resource }
