/* eslint-disable func-names */
process.env.NODE_ENV = 'test'
process.env.TEST_MONGO_URL = process.env.TEST_MONGO_URL || 'mongodb://localhost/admin-bro-mongoose'

const chai = require('chai')
const sinonChai = require('sinon-chai')
const sinon = require('sinon')
const mongoose = require('mongoose')
const { factory } = require('factory-girl')

chai.use(sinonChai)

global.expect = chai.expect
global.factory = factory

require('./fixtures/factories.js')

before(async function () {
  this.mongooseConnection = await mongoose.connect(process.env.TEST_MONGO_URL)
})

beforeEach(function () {
  this.sinon = sinon.createSandbox()
})

afterEach(function () {
  this.sinon.restore()
})

after(function () {
  Object.values(this.mongooseConnection.models).forEach(model => model.remove({}))
  this.mongooseConnection.connection.close()
})

require('./database.spec.js')
require('./resource.spec.js')
require('./property.spec.js')
require('./utils/create-cast-error.spec.js')
require('./utils/create-validation-error.spec.js')
