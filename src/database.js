const { BaseDatabase } = require('admin-bro')

class Database extends BaseDatabase {
  constructor(connection) {
    super(connection)
    this.connection = connection
  }

  resources() {
    return this.connection.modelNames().map(name => this.connection.model(name))
  }
}

module.exports = Database
