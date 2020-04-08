const mongoose = require('mongoose')

const NestedObject = new mongoose.Schema({
  someProperty: Number,
})

const SubType = new mongoose.Schema({
  name: String,
  surname: String,
  age: Number,
  nestedArray: [NestedObject],
  nestedObject: NestedObject,
})

global.User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  genre: { type: String, enum: ['male', 'female'] },
  arrayed: [String],
  parent: SubType,
  family: [SubType],
}))

global.Pesel = mongoose.model('Pesel', new mongoose.Schema({
  pesel: {
    type: String, unique: true, required: true, sparse: true,
  },
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
