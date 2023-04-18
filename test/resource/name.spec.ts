import Resource from '../../src/resource.js'
import { User } from '../utils/models.js'

describe('Resource #name', () => {
  it('returns name of the model', () => {
    const resource = new Resource(User)

    expect(resource.name()).toEqual('User')
  })
})
