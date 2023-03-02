import Property from '../../src/property.js'
import Resource from '../../src/resource.js'
import { User } from '../utils/models.js'

describe('Resource #property', () => {
  let resource
  let returnedProperty

  beforeEach(() => {
    resource = new Resource(User)
    returnedProperty = resource.property('email')
  })

  it('returns selected property for an email', () => {
    expect(returnedProperty.name()).toEqual('email')
  })

  it('returns instance of Property class', () => {
    expect(returnedProperty).toBeInstanceOf(Property)
  })
})
