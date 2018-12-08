const mongoose = require('mongoose')

global.User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
}))

factory.define('user', User, {
  email: factory.sequence('User.email', n => `john@doe${n}.com`),
  passwordHash: 'somehashedpassword',
})
