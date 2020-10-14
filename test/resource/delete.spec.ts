import { factory } from 'factory-girl'
import Resource from '../../src/resource'
import { User } from '../utils/models'

describe('Resource #delete', () => {
  let startCount
  let idOfItemToDelete
  let resource

  let userRecords: any
  let count: number

  beforeEach(async () => {
    count = 12
    userRecords = await factory.createMany('user', count)
  })

  beforeEach(async () => {
    startCount = await User.countDocuments()
    idOfItemToDelete = userRecords[0]._id
    resource = new Resource(User)
    await resource.delete(idOfItemToDelete)
  })

  it('removes the item from the database', async () => {
    expect(await User.countDocuments()).toEqual(startCount - 1)
  })
})
