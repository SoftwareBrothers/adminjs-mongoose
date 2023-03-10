import { factory } from 'factory-girl'
import mongoose from 'mongoose'

// const globalAny = global as any

// @ts-ignore
const NestedObject = new mongoose.Schema({
  someProperty: Number,
})

// @ts-ignore
const SubType = new mongoose.Schema({
  name: String,
  surname: String,
  age: Number,
  nestedArray: [NestedObject],
  nestedObject: NestedObject,
})

export const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  genre: { type: String, enum: ['male', 'female'] },
  arrayed: [String],
  parent: SubType,
  family: [SubType],
}))

export const Pesel = mongoose.model('Pesel', new mongoose.Schema({
  pesel: {
    type: String, unique: true, required: true, sparse: true,
  },
}))

export const Article = mongoose.model('Article', new mongoose.Schema({
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

// export const { User, Article, Pesel }: Record<string, mongoose.Model<any>> = globalAny

factory.define('user', User, {
  email: factory.sequence('User.email', (n) => `john@doe${n}.com`),
  passwordHash: 'somehashedpassword',
})
