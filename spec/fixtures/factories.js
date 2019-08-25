const mongoose = require('mongoose')

const SubType = new mongoose.Schema({
  name: String,
  surname: String,
})

global.User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  genre: { type: String, enum: ['male', 'female'] },
  arrayed: [String],
  parent: SubType,
  family: [SubType],
}))

global.Article = mongoose.model('Article', new mongoose.Schema({
  content: String,
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}))

factory.define('user', User, {
  email: factory.sequence('User.email', n => `john@doe${n}.com`),
  passwordHash: 'somehashedpassword',
})
