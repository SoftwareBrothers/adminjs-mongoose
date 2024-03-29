import Resource from '../../src/resource.js'
import { User } from '../utils/models.js'

describe('Resource #parseParams', () => {
  let resource

  beforeEach(() => {
    resource = new Resource(User)
  })

  it('converts empty strings to nulls for ObjectIDs', () => {
    expect(resource.parseParams({ _id: '' })).toHaveProperty('_id', null)
  })

  it('converts empty strings to [] for arrays', () => {
    expect(resource.parseParams({ family: '' })).toHaveProperty('family', [])
  })
})
