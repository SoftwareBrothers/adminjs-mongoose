import Resource from '../../src/resource.js'
import { User } from '../utils/models.js'

describe('Resource #position', () => {
  it('returns position of a parent field', () => {
    const property = new Resource(User).property('parent')

    expect(property.position()).toEqual(4)
  })
})
