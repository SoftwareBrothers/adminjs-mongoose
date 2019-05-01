const mongoose = require('mongoose')

global.User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  genre: { type: String, enum: ['male', 'female'] },
}))

global.Article = mongoose.model('Article', new mongoose.Schema({
  content: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}))

factory.define('user', User, {
  email: factory.sequence('User.email', n => `john@doe${n}.com`),
  passwordHash: 'somehashedpassword',
})
