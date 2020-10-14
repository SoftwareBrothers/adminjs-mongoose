import Resource from '../../src/resource'
import { Article } from '../utils/models'

describe('Resource #update', () => {
  let params
  let resource
  let recordId

  beforeEach(async () => {
    params = {
      content: 'Test content',
    }

    resource = new Resource(Article)
    const res = await resource.create(params)
    recordId = res._id
  })

  afterEach(async () => {
    await Article.deleteMany({})
  })

  it('change record and return updated', async () => {
    const article = await resource.update(
      recordId,
      { content: 'Updated content' },
    )

    expect(article.content).toEqual('Updated content')
  })
})
