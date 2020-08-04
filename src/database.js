const { BaseDatabase } = require('admin-bro')
const Resource = require('./resource')

class Database extends BaseDatabase {
  static isAdapterFor(connection) {
    return connection.constructor.name === 'Mongoose'
  }

  constructor(connection) {
    super(connection)
    this.connection = connection
  }

  resources() {
    return this.connection.modelNames().map(name => (
      new Resource(this.connection.model(name))
    ))
  }
}

module.exports = Database
