import Resource from '../../src/resource.js'
import { User } from '../utils/models.js'

describe('Resource', () => {
  describe('#constructor', () => {
    it('stores original model', () => {
      const userResource = new Resource(User)
      expect(userResource.MongooseModel).toEqual(User)
    })
  })
})
