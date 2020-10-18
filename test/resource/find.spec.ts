import { BaseRecord, Filter } from 'admin-bro'
import { factory } from 'factory-girl'
import Resource from '../../src/resource'
import { User } from '../utils/models'

describe('Resource #find', () => {
  it('returns first n items', async () => {
    await factory.createMany('user', 10)
    const resource = new Resource(User)
    const limit = 5
    const offset = 0

    const returnedItems = await resource.find(new Filter({}, User), {
      limit,
      offset,
    })

    expect(returnedItems.length).toEqual(limit)
    expect(returnedItems[0]).toBeInstanceOf(BaseRecord)
  })
})
