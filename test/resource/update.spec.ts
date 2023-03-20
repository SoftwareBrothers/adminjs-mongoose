import Resource from '../../src/resource.js'
import { Article } from '../utils/models.js'

describe('Resource #update', () => {
  it('changes record and returns updated', async () => {
    const resource = new Resource(Article)
    const initialRecord = await resource.create({
      content: 'Test content',
    })

    const updatedRecord = await resource.update(
      initialRecord._id,
      { content: 'Updated content' },
    )

    expect(updatedRecord.content).toEqual('Updated content')
  })
})
