import { factory } from 'factory-girl'
import Resource from '../../src/resource'
import { Article, User } from '../utils/models'

describe('Resource #populate', () => {
  let userRecords: any
  let count: number

  beforeEach(async () => {
    count = 12
    userRecords = await factory.createMany('user', count)
  })

  describe('record with reference', () => {
    let params
    let resource
    let record

    beforeEach(async () => {
      params = { content: '', createdBy: userRecords[1]._id }
      resource = new Resource(Article)
      const res = await resource.create(params)
      record = await resource.findOne(res._id)
    })

    afterEach(async () => {
      await Article.deleteMany({})
    })

    it('populates the resource', async () => {
      const user = new Resource(User)
      await user.populate([record], resource.property('createdBy'))
      expect(record.populated.createdBy.param('email')).toEqual(userRecords[1].email)
    })
  })

  describe('record with array of references', () => {
    let params
    let resource
    let record

    beforeEach(async () => {
      params = {
        content: '',
        owners: [userRecords[2]._id, userRecords[3]._id],
      }
      resource = new Resource(Article)
      const res = await resource.create(params)
      record = await resource.findOne(res._id)
    })

    afterEach(async () => {
      await Article.deleteMany({})
    })

    it('populates all the nested fields in a resource', async () => {
      const user = new Resource(User)
      await user.populate([record], resource.property('owners'))
      expect(Object.keys(record.populated).length).toEqual(2)
      expect(record.populated['owners.0'].param('email')).toEqual(userRecords[2].email)
      expect(record.populated['owners.1'].param('email')).toEqual(userRecords[3].email)
    })
  })
})
