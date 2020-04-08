const MongooseDatabase = require('../src/database')

describe('Database', function () {
  describe('#resources', function () {
    beforeEach(function () {
      this.resources = new MongooseDatabase(this.mongooseConnection).resources()
    })

    it('return all resources', function () {
      expect(this.resources).to.have.lengthOf(3)
    })
  })
})
